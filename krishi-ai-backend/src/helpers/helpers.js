const { ObjectId } = require("mongoose").Types;
const { findOneAssistant } = require("../dbs/assistantDb");
const { V3_PLANS } = require("../config/v3Plans");
const { V4_PLANS } = require("../config/v4Plans");
const { requestDataAPI } = require("./dataAPIHelpers");

const specialCharIgnore = (val) => {
  return val.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

const formatQuery = async (assistantId, allFilters, timeStamp) => {
  try {
    const modifiedFilters = { assistantId };
    const yesterday = new Date(
      new Date(timeStamp).getTime() - 24 * 60 * 60 * 1000
    );

    if (timeStamp) {
      modifiedFilters.lastChat = {
        $lte: new Date(timeStamp),
      };
    }

    if (allFilters === null) {
      if (timeStamp) {
        modifiedFilters.lastActive = {
          $not: {
            $gt: yesterday,
          },
        };
      }
      return [null, modifiedFilters];
    }

    const [error, assistant] = await findOneAssistant({
      _id: assistantId,
    });
    if (error) throw error;

    const currentPlan =
      assistant.type === "v3"
        ? V3_PLANS[assistant.activePlan]
        : V4_PLANS[assistant.activePlan];

    if (allFilters?.blocked === "yes") {
      modifiedFilters.blocked = { $eq: true };
    }

    if (allFilters?.blocked === "no") {
      modifiedFilters.blocked = { $ne: true };
    }

    if (allFilters?.optedIn === "yes") {
      modifiedFilters.optedIn = { $ne: false };
    }

    if (allFilters?.optedIn === "no") {
      modifiedFilters.optedIn = { $eq: false };
    }

    const { filters, dateFilters } = allFilters || {};
    const { lastActive, createdAt } = dateFilters || {};

    if (lastActive && lastActive.startDate) {
      modifiedFilters.lastActive = {
        $gt: new Date(lastActive.startDate),
        $lte: new Date(lastActive.endDate),
      };
    }
    if (createdAt && createdAt.startDate) {
      modifiedFilters.createdOn = {
        $gt: new Date(createdAt.startDate),
        $lte: new Date(createdAt.endDate),
      };
    }

    if (
      (modifiedFilters.lastActive &&
        timeStamp &&
        modifiedFilters.lastActive.$lte > yesterday) ||
      (!modifiedFilters.lastActive && timeStamp)
    ) {
      modifiedFilters.lastActive = {
        ...modifiedFilters.lastActive,
        $not: {
          $gt: yesterday,
        },
      };
    }

    const $or = [{ $and: [{}] }];

    (filters || []).map((filter) => {
      if (filter.attributeKey === "") return;

      const currentArrIndex = $or.length - 1;
      const formattedFilter = {};

      switch (filter.operator) {
        case "is":
          if (filter.value === "SET") {
            formattedFilter[filter.attributeKey] = { $exists: true };
          } else if (filter.value === "NOT SET") {
            formattedFilter[filter.attributeKey] = { $exists: false };
          } else if (
            filter.value === "Yes" &&
            filter.attributeType === "Boolean"
          ) {
            if (filter.attributeKey === "isRequesting") {
              formattedFilter[filter.attributeKey] = { $ne: null };
            } else {
              formattedFilter[filter.attributeKey] = { $eq: true };
            }
          } else if (
            filter.value === "No" &&
            filter.attributeType === "Boolean"
          ) {
            if (filter.attributeKey === "isRequesting") {
              formattedFilter[filter.attributeKey] = { $eq: null };
            } else {
              formattedFilter[filter.attributeKey] = { $eq: false };
            }
          } else if (
            filter.attributeType === "Status" &&
            filter.attributeKey === "sessionPeriod"
          ) {
            let currentBillingStartDate = 0;
            if (currentPlan?.frequency === "yearly") {
              const activationDate = new Date(assistant.planActivatedOn);
              const now = new Date().getTime();
              const currentDate = activationDate.getDate();
              for (let i = 0; i < 13; i++) {
                const cycleStart = activationDate.getTime();
                activationDate.setDate(1);
                activationDate.setMonth(activationDate.getMonth() + 1);
                const daysInMonth = new Date(
                  activationDate.getFullYear(),
                  activationDate.getMonth() + 1,
                  0
                ).getDate();
                const cycleEnd = activationDate.setDate(
                  Math.min(currentDate, daysInMonth)
                );
                if (now >= cycleStart && now < cycleEnd) {
                  currentBillingStartDate = cycleStart;
                }
              }
            }
            const startCycle = new Date(
              currentPlan?.frequency === "yearly"
                ? currentBillingStartDate
                : assistant.planActivatedOn
            );
            if (filter.value === "Active") {
              formattedFilter[filter.attributeKey] = { $eq: startCycle };
            }
            if (filter.value === "Inactive") {
              formattedFilter[filter.attributeKey] = { $ne: startCycle };
            }
          } else if (
            filter.attributeType === "Status" &&
            filter.attributeKey === "whatsappConvoExpTime"
          ) {
            if (filter.value === "Active") {
              formattedFilter[filter.attributeKey] = { $gt: new Date() };
            }
            if (filter.value === "Inactive") {
              formattedFilter[filter.attributeKey] = {
                $not: { $gt: new Date() },
              };
            }
          } else if (filter.value !== "") {
            if (filter.attributeKey === "firstMessage") {
              formattedFilter[`${filter.attributeKey}._id`] = {
                $eq: ObjectId(filter.value._id),
              };
            } else {
              formattedFilter[filter.attributeKey] = {
                $eq: filter.value,
              };
            }
          }
          break;

        case "is not":
          if (filter.value === "SET") {
            formattedFilter[filter.attributeKey] = { $exists: false };
          } else if (filter.value === "NOT SET") {
            formattedFilter[filter.attributeKey] = { $exists: true };
          } else if (filter.value !== "") {
            if (filter.attributeKey === "firstMessage") {
              formattedFilter[`${filter.attributeKey}._id`] = {
                $ne: ObjectId(filter.value._id),
              };
            } else {
              formattedFilter[filter.attributeKey] = {
                $ne: filter.value,
              };
            }
          }
          break;

        case "contains":
          formattedFilter[filter.attributeKey] = {
            $regex: specialCharIgnore(filter.value),
            $options: "i",
          };
          break;

        case "not contains":
          formattedFilter[filter.attributeKey] = {
            $not: { $regex: specialCharIgnore(filter.value), $options: "i" },
          };
          break;

        case "has":
          if (filter.attributeKey === "tags") {
            formattedFilter[`${filter.attributeKey}.tagId`] = {
              $eq: ObjectId(filter.value._id),
            };
          } else {
            formattedFilter[`${filter.attributeKey}.name`] = {
              $eq: filter.value,
            };
          }
          break;

        case "not has":
          if (filter.attributeKey === "tags") {
            formattedFilter[`${filter.attributeKey}.tagId`] = {
              $ne: ObjectId(filter.value._id),
            };
          } else {
            formattedFilter[`${filter.attributeKey}.name`] = {
              $ne: filter.value,
            };
          }
          break;

        default:
          break;
      }

      if (!$or[currentArrIndex].$and) {
        $or[currentArrIndex].$and = [];
      }
      $or[currentArrIndex].$and.push(formattedFilter);
      if (filter.condition === "or") {
        $or.push({ $and: [] });
      }
    });

    modifiedFilters["$or"] = $or;
    const queryObject = {
      assistantId,
      ...modifiedFilters,
    };

    return [null, queryObject];
  } catch (error) {
    return [error, null];
  }
};

const formatAudienceQuery = (body) => {
  const {
    assistantId,
    section,
    campaignId,
    timeSection,
    selectedReply,
    createdAt,
    notRead,
    hasRead,
    notClicked,
    hasClicked,
    notReplied,
    hasReplied,
    ctaList,
    failureSection,
    providerType,
  } = body;

  let queryObj = {
    assistantId,
    campaignId,
  };

  if (section === "CLICKED") {
    if (timeSection) {
      queryObj["$expr"] = {
        $lte: [
          "$linkClickedAt",
          {
            $add: [
              "$sentAt",
              (timeSection === "24 Hours"
                ? 24
                : timeSection === "3 Hours"
                ? 3
                : 1) *
                60 *
                60000,
            ],
          },
        ],
      };
    }

    queryObj.linkClickedAt = { $exists: true };
  }

  if (section === "REPLIED") {
    if (timeSection) {
      queryObj["$expr"] = {
        $lte: [
          "$respondedAt",
          {
            $add: [
              "$sentAt",
              (timeSection === "24 Hours"
                ? 24
                : timeSection === "3 Hours"
                ? 3
                : 1) *
                60 *
                60000,
            ],
          },
        ],
      };
    }
    queryObj.respondedAt = { $exists: true };
    if (selectedReply?.length) {
      queryObj.$or = selectedReply.map((i) => {
        return i === "Other Responses"
          ? { responseBody: { $nin: ctaList || [] } }
          : { responseBody: i };
      });
    }
  }

  if (section === "SENT") {
    queryObj.sentAt = { $exists: true };
  }

  if (section === "DELIVERED") {
    queryObj.deliveredAt = { $exists: true };
    if (hasRead !== notRead) {
      if (hasRead) {
        queryObj.readAt = { $exists: true };
      } else {
        queryObj.readAt = { $exists: false };
      }
    }
    // if (hasReplied !== notReplied) {
    //   if (hasReplied) {
    //     queryObj.respondedAt = { $exists: true };
    //   } else {
    //     queryObj.respondedAt = { $exists: false };
    //   }
    // }
  }

  if (section === "READ") {
    queryObj.readAt = { $exists: true };
    if (hasClicked !== notClicked) {
      if (hasClicked) {
        queryObj.linkClickedAt = { $exists: true };
      } else {
        queryObj.linkClickedAt = { $exists: false };
      }
    }
    if (hasReplied !== notReplied) {
      if (hasReplied) {
        queryObj.respondedAt = { $exists: true };
      } else {
        queryObj.respondedAt = { $exists: false };
      }
    }
  }

  if (section === "FAILED") {
    queryObj.failedAt = { $exists: true };
    if (failureSection === "On WhatsApp") {
      queryObj["failurePayload.code"] = {
        $ne: ["v2", "v3"].includes(providerType) ? 1013 : 1002,
      };
    }
    if (failureSection === "Not on WhatsApp") {
      queryObj["failurePayload.code"] = ["v2", "v3"].includes(providerType)
        ? 1013
        : 1002;
    }
  }

  return queryObj;
};

const getDailyTemplateQuota = async (assistant) => {
  const { _id: assistantId } = assistant;
  if (assistant.dailyTemplateLimit > 100000) {
    return {
      dailyTemplateLimit: assistant.dailyTemplateLimit,
      consumedTemplateLimitQuota: 0,
    };
  }

  //  Dividing in 5 - 5 minutes slot and 288 slots is 24 hrs back
  const slotNumber = Math.floor(new Date().getTime() / 300000) - 288;
  const result = await requestDataAPI("find", "bicusageaggs", {
    slotNumber: { $gte: slotNumber },
    assistantId: { $oid: assistantId },
  });

  const consumedTemplateLimitQuota = result.documents.reduce((acc, i) => {
    return acc + (i.count || 0);
  }, 0);

  return {
    dailyTemplateLimit: assistant.dailyTemplateLimit,
    consumedTemplateLimitQuota,
  };
};

/**
 * This function is used to find relative path of the request url
 * @param {express.Request<ParamsDictionary, any, any, qs.ParsedQs, Record<string, any>>} req
 * @param {Router} router
 * @returns { {path: string,params: object[]} | undefined}
 */
const matchRouterPath = (req, router) => {
  // Iterate through the router's middleware stack to find the matching route
  const incomingUrl = req.url;
  const incomingMethod = req.method.toLowerCase();

  // Iterate through the router's middleware stack to find the matching route
  for (const layer of router.stack) {
    if (
      layer.route &&
      layer.route.path &&
      layer.route.methods[incomingMethod]
    ) {
      const routePathSegments = layer.route.path.split("/");
      const incomingUrlSegments = incomingUrl.split("/");

      if (routePathSegments.length === incomingUrlSegments.length) {
        let isMatch = true;
        const params = {};

        for (let i = 0; i < routePathSegments.length; i++) {
          const routeSegment = routePathSegments[i];
          const urlSegment = incomingUrlSegments[i];

          if (routeSegment.startsWith(":")) {
            // Parameter placeholder in route
            const paramName = routeSegment.substr(1);
            params[paramName] = urlSegment;
          } else if (routeSegment !== urlSegment) {
            isMatch = false;
            break;
          }
        }

        if (isMatch) {
          return {
            path: layer.route.path,
            params: params,
          };
        }
      }
    }
  }
};

module.exports = {
  formatQuery,
  formatAudienceQuery,
  matchRouterPath,
  getDailyTemplateQuota,
};
