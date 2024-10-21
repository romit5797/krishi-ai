const qs = require("qs");
const { default: axios } = require("axios");

const assistantDb = require("../dbs/assistantDb");
const { V4_PLANS } = require("../config/v4Plans");
const validate = require("../validators/apiValidators");
const { languageCode } = require("../helpers/languageCode");
const TemplateMessage = require("../models/TemplateMessage");
const { redisClient } = require("../helpers/redis-instance");
const templateMsgHelper = require("../helpers/templateMsgHelper");
const { generatetemplate } = require("../helpers/generateTemplate");
const { SYSTEM_USER_ACCESS_TOKEN, WABA_APP_ID } = require("../config/config");

var FormData = require("form-data");

const saveTemplateMessage = async (templateMessageObj) => {
  try {
    const { name, assistantId } = templateMessageObj;
    const exists = await TemplateMessage.findOne({ name, assistantId });
    if (exists) {
      throw "Template Message name already exists";
    }

    const templateMessage = new TemplateMessage(templateMessageObj);
    await templateMessage.save();
    return [null, templateMessage];
  } catch (error) {
    return [error, false];
  }
};

const findTemplateMessages = async (queryObj, projection = {}) => {
  try {
    const templateMessages = await TemplateMessage.find(
      queryObj,
      projection
    ).lean();
    return [null, templateMessages];
  } catch (error) {
    return [error, null];
  }
};

const findTemplateMessage = async (queryObj, skipObj) => {
  try {
    const templateMessage = await TemplateMessage.findOne(queryObj, skipObj);
    return [null, templateMessage];
  } catch (error) {
    return [error, null];
  }
};

const findTemplateMsgSuperAdmin = async (queryObj, project, options) => {
  try {
    const { limit, skip, order } = options;
    const templates = await TemplateMessage.aggregate([
      { $match: queryObj },
      { $sort: { createdAt: order || -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);
    return [null, templates];
  } catch (error) {
    return [error, false];
  }
};

const findTemplateMsgCount = async (queryObj) => {
  try {
    const count = await TemplateMessage.find(queryObj).countDocuments();
    return [null, count];
  } catch (error) {
    return [error, false];
  }
};

const updateTemplateMsg = async (queryObj, updateQuery) => {
  try {
    const templateMessage = await TemplateMessage.updateMany(
      { ...queryObj },
      { ...updateQuery }
    );
    return [null, templateMessage];
  } catch (error) {
    return [error, null];
  }
};

/**
 *
 * @param {Array<[Record<string, any>, Record<string, any>]} updateObjs
 * @returns
 */
const updateTemplateMsgBulk = async (updateObjs) => {
  try {
    const response = await TemplateMessage.bulkWrite(
      updateObjs.map((updateObj) => {
        const [filter, obj] = updateObj;
        return {
          updateOne: {
            filter,
            update: { $set: obj },
          },
        };
      })
    );
    return response;
  } catch (error) {
    console.log(error);
  }
};

// Warning: Only for superadmin usages
const setTemplatefields = async (queryObj, updateQuery) => {
  try {
    const templateMessage = await TemplateMessage.updateOne(
      { ...queryObj },
      { ...updateQuery }
    );
    return [null, templateMessage];
  } catch (error) {
    return [error, null];
  }
};

const fullyDeleteTemplateMessages = async (clientId) => {
  try {
    const response = await TemplateMessage.deleteMany({ clientId });
    return [null, response];
  } catch (error) {
    return [error, null];
  }
};

const setTemplateSyncCountInCache = async (assistantId) => {
  try {
    const key = `templateSyncCount/${assistantId}`;
    const value = 1;
    const retentionPeriod = 5 * 60;
    const data = await redisClient.get(key);
    let oldValue = data ? data : null;
    if (oldValue) {
      if (oldValue == 1) {
        oldValue = 2;
        await redisClient.setex(key, retentionPeriod, oldValue);
      } else {
        const expireTime = (await redisClient.ttl(key)) || retentionPeriod;
        throw new Error(
          `Please wait for ${Math.ceil(expireTime / 60)} minutes!`
        );
      }
    } else {
      await redisClient.setex(key, retentionPeriod, value);
    }
  } catch (err) {
    throw err;
  }
};

const getTemplateSyncTime = async (assistantId) => {
  try {
    const key = `templateSyncCount/${assistantId}`;
    const data = await redisClient.get(key);
    const remainingTime = await redisClient.ttl(key);
    return data === "2" ? remainingTime : 0;
  } catch (err) {
    throw err;
  }
};

/**
 * Creates a template message in the database.
 *
 * @param {Object} body - The body of the template message.
 * @param {String} assistantId - The assistant id.
 * @param {Boolean} checkValidity - Check if the template message is valid. DEFAULT: true
 * @param {Boolean} updateExisting - Update existing template message. DEFAULT: false
 * @return {Object} savedTemplate - The saved template message.
 */
const createTemplate = async (
  body,
  assistantId,
  checkValidity = true,
  updateExisting = false
) => {
  let template = {
    label: body.label,
    category: body.category,
    type: body.type,
    language: body.language || body.templateLanguage,
    name: body.name,
    format: body.format,
    sampleMessage: body.sampleMessage,
    actionType: body.actionType,
    callToAction: body.callToAction,
    quickReplies: body.quickReplies,
    sampleMediaUrl: body.sampleMediaUrl,
    sampleCTAUrl: body.sampleCTAUrl,
    isClickTrackingEnabled: body.isClickTrackingEnabled,
    iconUrl: body.iconUrl,
    templateParams: body.templateParams,
  };

  if (body.headerText) template.headerText = body.headerText;
  if (body.footerText) template.footerText = body.footerText;
  if (body.carouselCards && body.type === "CAROUSEL") {
    template.carouselCards = body.carouselCards;
  }

  let sampleMedia;
  if (checkValidity) {
    const [validationError, isTemplateValid] =
      validate.templateMessage(template);
    // console.log({ validationError, isTemplateValid });
    if (validationError) throw validationError;
    if (!isTemplateValid) throw "One or more invalid template fields found.";
  }

  // Append interactive button in format
  if (template.actionType == "None") {
    template.quickReplies = [];
    template.callToAction = [];
  } else if (template.actionType == "CAT") {
    template.quickReplies = [];
    template.callToAction.forEach((e) => {
      template.format += " | [" + e.buttonTitle + "," + e.buttonValue + "]";
      if (e.type == "URL") {
        template.sampleCTAUrl = template.sampleCTAUrl.replace(
          /\[([^\]]+)\]/g,
          (match) => match.substr(1, match.length - 2)
        );
      }
    });
  } else if (template.actionType == "QuickReplies") {
    template.callToAction = [];
    template.quickReplies.forEach((e) => {
      template.format += " | [" + e + "]";
    });
  }
  // Set parameter count
  template.parameters = templateMsgHelper.extractParameters(
    template.format
  ).length;

  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();

  const [err, assistant] = await assistantDb.findOneAssistant({
    _id: assistantId,
  });

  const planDetails = V4_PLANS[assistant.activePlan];
  if (
    template.isClickTrackingEnabled &&
    !(
      (assistant.providerType === "v3" &&
        ((assistant.type === "v3" &&
          assistant.activePlan !== "NONE" &&
          assistant.activePlan !== "BASIC_TRIAL" &&
          assistant.activePlan !== "BASIC_MONTHLY_TIER_1" &&
          assistant.activePlan !== "BASIC_YEARLY_TIER_1") ||
          (assistant.type === "v4" &&
            ["PRO", "ENTERPRISE"].includes(planDetails?.displayName)))) ||
      assistant.clickTrackingEnabled
    )
  ) {
    throw "Please upgrade to higher plans.";
  }

  if (!["TEXT", "LOCATION"].includes(template.type)) {
    let sampleMediaURL = template.sampleMediaUrl;
    if (template.type === "CAROUSEL") {
      for (const card of template.carouselCards) {
        const { components } = card;
        for (const component of components) {
          if (component.type === "HEADER") {
            sampleMediaURL = component.example.header_handle[0];
            break;
          }
        }

        if (sampleMediaURL) break;
      }
    }

    if (!sampleMediaURL) {
      source.cancel("Sample media URL missing.");
    }
    var sampleDownloadPending = true;

    setTimeout(() => {
      if (sampleDownloadPending) {
        source.cancel("Media file too large, please try a smaller file.");
      }
    }, 4000);

    sampleMedia = await axios
      .get(sampleMediaURL, {
        responseType: "arraybuffer",
        cancelToken: source.token,
      })
      .catch((error) => {
        if (axios.isCancel(error)) {
          throw error.message;
        } else
          throw `Sample media URL responded : ${
            error.message || "Unreachable"
          }`;
      });
    sampleDownloadPending = false;

    const MB_1 = 1000000;
    const buffer = sampleMedia.data;
    const sampleMediaSize = Buffer.byteLength(buffer);
    if (!sampleMediaSize)
      throw "Media has no content about size, Please try some other file";
    if (template.type === "IMAGE" && sampleMediaSize > 2 * MB_1)
      throw "Image size exceeds 2MB";
    if (template.type === "VIDEO" && sampleMediaSize > 20 * MB_1)
      throw "Video size exceeds 20MB";
    if (template.type === "FILE" && sampleMediaSize > 2 * MB_1)
      throw "File size exceeds 2MB";

    if (assistant.providerType === "v3") {
      const sessionRes = await axios.post(
        `https://graph.facebook.com/v14.0/${WABA_APP_ID}/uploads?file_length=${sampleMediaSize}&file_type=${
          sampleMedia.headers?.["content-type"] || "image/png"
        }&access_token=${SYSTEM_USER_ACCESS_TOKEN}`
      );

      const handleResponse = await axios.post(
        `https://graph.facebook.com/v15.0/${sessionRes.data?.id}`,
        sampleMedia.data,
        {
          headers: {
            "Content-Type":
              sampleMedia.headers?.["content-type"] || "image/png",
            Authorization: `OAuth ${SYSTEM_USER_ACCESS_TOKEN}`,
            file_offset: "0",
          },
        }
      );

      if (template.type === "CAROUSEL") {
        for (const card of template.carouselCards) {
          const { components } = card;
          for (const component of components) {
            if (component.type === "HEADER") {
              component.example.header_handle[0] = handleResponse.data.h;
              break;
            }
          }
        }
      } else {
        template.sampleMediaUrl = handleResponse.data.h;
      }
    }
  }

  if (err) throw "Unable to find your assistant. Try again.";
  // Check if account is verified
  if (!assistant.isWhatsappVerified) {
    throw "WhatsApp Business API isn't verified yet ! Come back later.";
  }

  //  Sent template to 360 Dialog for provider v2
  let response;
  if (assistant.providerType === "v3") {
    const [err, exists] = await findTemplateMessage({
      assistantId,
      name: template.name,
    });
    if (!updateExisting && exists) {
      throw "Template Message name already exists";
    }
    const paramCount = (
      (template.format.split(" | [")[0] || "").match(/\{\{[0-9]+\}\}/g) || []
    ).length;

    // Generate Template
    const d360Template = generatetemplate({ template, assistant, paramCount });

    response = await axios.post(
      `https://graph.facebook.com/v15.0/${
        assistant.wabaAppId
      }/message_templates?name=${d360Template.name}&language=${
        d360Template.language
      }&category=${d360Template.category}&components=${encodeURIComponent(
        JSON.stringify(d360Template.components)
      )}&access_token=${SYSTEM_USER_ACCESS_TOKEN}`
    );
    const { id } = response.data;
    template.status === "PENDING";
    template.namespace = assistant.templateNamespace;
    template.templateId = id;
  } else if (assistant.providerType === "v2") {
    const [err, exists] = await findTemplateMessage({
      assistantId,
      name: template.name,
    });
    if (exists) {
      throw "Template Message name already exists";
    }
    const paramCount = (
      (template.format.split(" | [")[0] || "").match(/\{\{[0-9]+\}\}/g) || []
    ).length;
    const config = {
      headers: {
        "D360-API-KEY": assistant.apiKey360,
        "Content-Type": "application/json",
      },
    };
    const d360Template = {
      name: template.name,
      category: template.category,
      language: languageCode(template.language),
      components: [
        {
          type: "BODY",
          text: template.format.split(" | [")[0] || "",
        },
      ],
    };
    if (paramCount) {
      const replacementText = (
        template.sampleMessage.match(/\[([^\]]+)\]/g) || []
      ).map((i) => i.substring(1, i.length - 1));
      if (paramCount !== replacementText.length) {
        throw "Sample message doesn't match with template format";
      }
      d360Template.components[0]["example"] = {
        body_text: [replacementText],
      };
    }
    if (template.actionType == "CAT") {
      d360Template.components.push({
        type: "BUTTONS",
        buttons: template.callToAction.map((i) => {
          if (i.type === "URL" && template.isClickTrackingEnabled) {
            const buttonPayload = {
              type: "URL",
              text: i.buttonTitle,
              url:
                assistant.partnerId &&
                assisntant.partnerId !== AISENSY_PARTNER_ID
                  ? "https://www.api-wa.co/tck/{{1}}"
                  : "https://ai-sensy.co/tck/{{1}}",
            };
            if (template.isClickTrackingEnabled) {
              buttonPayload["example"] =
                assistant.partnerId &&
                assistnat.partnerId !== AISENSY_PARTNER_ID
                  ? ["https://www.api-wa.co/tck/ywEeMF"]
                  : ["https://ai-sensy.co/tck/ywEeMF"];
            }
            return buttonPayload;
          } else if (i.type === "URL") {
            const buttonPayload = {
              type: "URL",
              text: i.buttonTitle,
              url: i.buttonValue.replace(/\{\{[0-9]+\}\}/g, (match) => "{{1}}"),
            };
            if (template.sampleCTAUrl) {
              buttonPayload["example"] = [template.sampleCTAUrl];
            }

            return buttonPayload;
          }
          if (i.type === "Phone Number") {
            return {
              type: "PHONE_NUMBER",
              text: i.buttonTitle,
              phone_number: i.buttonValue,
            };
          }
        }),
      });
    }

    if (template.actionType == "QuickReplies") {
      d360Template.components.push({
        type: "BUTTONS",
        buttons: template.quickReplies.map((i) => {
          return {
            type: "QUICK_REPLY",
            text: i,
          };
        }),
      });
    }

    if (template.type !== "TEXT") {
      d360Template.components.unshift({
        type: "HEADER",
        format: template.type === "FILE" ? "DOCUMENT" : template.type,
        example: {
          header_handle: [template.sampleMediaUrl],
        },
      });
    }

    if (template.headerText) {
      d360Template.components.push({
        type: "HEADER",
        format: "TEXT",
        text: template.headerText,
      });
    }

    if (template.footerText) {
      d360Template.components.push({
        type: "FOOTER",
        text: template.footerText,
      });
    }

    if (template.category === "AUTHENTICATION") {
      const buttonIdx = d360Template.components.findIndex(
        (e) => e.type === "BUTTONS"
      );
      const otpCopyButton = {
        type: "OTP",
        otp_type: "COPY_CODE",
        text: "Copy Code",
      };

      if (buttonIdx != -1) {
        d360Template.components[buttonIdx].buttons.push(otpCopyButton);
      } else {
        d360Template.components.push({
          type: "BUTTONS",
          buttons: [otpCopyButton],
        });
      }
    }

    response = await axios.post(
      "https://waba.360dialog.io/v1/configs/templates",
      d360Template,
      config
    );

    const { namespace, status, rejected_reason } = response.data;
    if (status === "submitted") {
      template.status === "PENDING";
    }
    template.namespace = namespace || "";
    template.rejectedReason = rejected_reason || "";
  } else {
    const [err, exists] = await findTemplateMessage({
      assistantId,
      name: template.name,
    });
    if (exists) {
      throw "Template Message name already exists";
    }
    const paramCount = (
      (template.format.split(" | [")[0] || "").match(/\{\{[0-9]+\}\}/g) || []
    ).length;
    const config = {
      headers: {
        token: assistant.gupshupAppToken,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    };
    const gsTemplate = {
      elementName: template.name,
      category: template.category,
      vertical: template.label,
      languageCode: languageCode(template.language),
      content: template.format.split(" | [")[0] || "",
    };

    const replacementText = (
      template.sampleMessage.match(/\[([^\]]+)\]/g) || []
    ).map((i) => i.substring(1, i.length - 1));

    if (paramCount !== replacementText.length) {
      throw "Sample message doesn't match with template format";
    }
    gsTemplate.example = template.sampleMessage.replace(/[\][]/g, "");

    if (template.actionType == "CAT") {
      let buttons = template.callToAction.map((i) => {
        if (template.isClickTrackingEnabled && i.type === "URL") {
          const buttonPayload = {
            type: "URL",
            text: i.buttonTitle,
            url:
              assistant.partnerId &&
              assistant.partnerId !== AISENSY_PARTNER_ID
                ? "https://www.api-wa.co/tck/{{1}}"
                : "https://ai-sensy.co/tck/{{1}}",
          };
          if (template.isClickTrackingEnabled && template.type !== "TEXT") {
            buttonPayload["example"] =
              assistant.partnerId &&
              assistant.partnerId !== AISENSY_PARTNER_ID
                ? ["https://www.api-wa.co/tck/ywEeMF"]
                : ["https://ai-sensy.co/tck/ywEeMF"];
            gsTemplate.enableSample = true;
          }
          return buttonPayload;
        } else if (i.type === "URL") {
          const buttonPayload = {
            type: "URL",
            text: i.buttonTitle,
            url: i.buttonValue.replace(/\{\{[0-9]+\}\}/g, (match) => "{{1}}"),
          };
          if (template.sampleCTAUrl && template.type !== "TEXT") {
            buttonPayload["example"] = [template.sampleCTAUrl];
            gsTemplate.enableSample = true;
          }
          return buttonPayload;
        }
        if (i.type === "Phone Number") {
          return {
            type: "PHONE_NUMBER",
            text: i.buttonTitle,
            phone_number: i.buttonValue,
          };
        }
      });

      gsTemplate.buttons = JSON.stringify(buttons);
    }
    if (template.actionType == "QuickReplies") {
      let quickReply = template.quickReplies.map((i) => {
        return {
          type: "QUICK_REPLY",
          text: i,
        };
      });
      gsTemplate.buttons = JSON.stringify(quickReply);
    }
    let templateType = template.type === "FILE" ? "DOCUMENT" : template.type;
    gsTemplate.templateType = templateType;
    if (template.type !== "TEXT") {
      gsTemplate.enableSample = true;
      let form = new FormData();
      const fileData = sampleMedia.data.toString("base64");
      form.append("file", fileData);
      form.append("file_type", sampleMedia.headers["content-type"]);
      const uploadResponse = await axios.post(
        `https://partner.gupshup.io/partner/app/${assistant.gupshupAppId}/upload/media`,
        form,
        {
          headers: {
            "Content-Type": `multipart/form-data; boundary=${form._boundary}`,
            Authorization: assistant.gupshupAppToken,
          },
        }
      );

      const handleId = uploadResponse?.data?.handleId?.message;
      if (!handleId) {
        throw new Error("Failed to upload file");
      }
      gsTemplate.exampleMedia = handleId;
    }

    if (template.category === "AUTHENTICATION") {
      const otpCopyButton = {
        type: "OTP",
        otp_type: "COPY_CODE",
        text: "Copy Code",
      };

      if (gsTemplate.buttons) {
        gsTemplate.buttons.push(otpCopyButton);
      } else {
        gsTemplate.buttons = [otpCopyButton];
      }
    }
    response = await axios.post(
      `https://partner.gupshup.io/partner/app/${assistant.gupshupAppId}/templates`,
      qs.stringify(gsTemplate),
      config
    );
    const responseData = response.data;
    if (responseData.status === "success") {
      template.status = responseData.template.status;
      template.templateId = responseData.template.id;
    }
  }

  // Temlate Name has to be unique & then save in db
  if (updateExisting) {
    const { namespace, status, rejected_reason } = response.data;
    await updateTemplateMsg(
      {
        assistantId,
        name: template.name,
      },
      {
        status: status === "submitted" ? "PENDING" : "REJECTED",
        namespace: namespace || "",
        rejectedReason: rejected_reason || "",
      }
    );
  } else {
    const [error, savedTemplate] = await saveTemplateMessage({
      ...template,
      templateLanguage: template.language,
      assistantId,
      clientId: assistant.clientId,
      assistantName: assistant.assistantName,
      partnerId:
        assistant.partnerId &&
        assistant.partnerId !== AISENSY_PARTNER_ID
          ? assistant.partnerId
          : null,
      processed: new Date(),
    });
    if (error) throw error;
    return savedTemplate;
  }
};

module.exports = {
  createTemplate,
  saveTemplateMessage,
  findTemplateMessages,
  findTemplateMessage,
  findTemplateMsgCount,
  updateTemplateMsg,
  updateTemplateMsgBulk,
  findTemplateMsgSuperAdmin,
  setTemplatefields,
  fullyDeleteTemplateMessages,
  setTemplateSyncCountInCache,
  getTemplateSyncTime,
};
