// const format = "This is {{1}} and the name of company is {{2}}."
// const sample = "This is [Ajay] and the name of company is [Triny]."

function ifFloating(format) {
  const validBracePattern = /\{\{[0-9]+\}\}/g; // only numbers wrapped by {{}} e.g {{1}}
  const validFloatingPattern = /^(?!\s*$)/g; // string with atleast one non-space character
  let ifFloating = false;
  // Check if each line as non-floating paramters
  format.split("\n").forEach((line) => {
    // Check if line has any content to run checks
    if (!!line.trim()) {
      const replacedText = line.replace(validBracePattern, (match) => "");
      const valid = validFloatingPattern.test(replacedText);
      if (!valid) {
        ifFloating = true;
      }
      console.log({
        replacedText,
        valid,
      });
    }
  });
  return ifFloating;
}

//Check numbers of params allowed with respect to the message length
function allowedRelativeParamLimit(format) {
  const paramCount = extractParameters(format).length;
  const formattedText = format.replace(/\s+/g, " ");
  const words = formattedText.split(" ").length - paramCount;
  const minWords = 2 * paramCount + 1;
  if (words >= minWords) return true;
  return false;
}

function validateFormat(format) {
  const validBracePattern = /\{\{[0-9]+\}\}/g;
  const invalidBracePattern = /(\{|\})/g;
  const invalidBracketPattern = /(\[|\])/g;
  // no more than 1,024 characters
  if (format.length > 1024) {
    return {
      valid: false,
      msg: "Template format length over 1024 characters.",
    };
  }
  // check for floating parameters
  // if (ifFloating(format)) {
  //   return {
  //     valid: false,
  //     msg: "Floating paramters aren't allowed in template format",
  //   };
  // }
  // check if the numbers of parameters are within the specified limit with respect to message length or words
  if (!allowedRelativeParamLimit(format)) {
    return {
      valid: false,
      msg: "This template contains too many variable parameters relative to the message length. You need to decrease the number of parameters or increase your message word count.",
    };
  }
  // replace valid {{}} with param value only
  const replacedText = format.replace(validBracePattern, (match) =>
    match.substring(2, match.length - 2)
  );
  // if { or } exists anywhere return false else true
  const ifCurlyValid = !invalidBracePattern.test(replacedText);
  if (!ifCurlyValid) {
    return { valid: false, msg: "Extra curly braces found in template format" };
  }
  // if [ or ] exists anywhere 	return false
  const ifBracketValid = !invalidBracketPattern.test(replacedText);
  if (!ifBracketValid) {
    return {
      valid: false,
      msg: "'[' or ']' aren't allowed in template format.",
    };
  }

  return { valid: true, msg: "Format seems legit." };
}

function extractParameters(format) {
  const validBracePattern = /\{\{[0-9]+\}\}/g;
  let parameters = [];

  function getParameter(match) {
    parameters.push(match.substring(2, match.length - 2));
  }

  const replacedText = format.replace(validBracePattern, getParameter);
  // console.log({parameters});
  return parameters;
}

function compareFormatAndSample(format, sample, strictOrdering) {
  let ifSame = false;
  const validBracePattern = /\{\{[0-9]+\}\}/g;
  const validBracketPattern = /\[([^\]]+)\]/g;
  const braceFreeText = format.replace(validBracePattern, (match) => "");
  const bracketFreeText = sample.replace(validBracketPattern, (match) => "");

  if (
    strictOrdering &&
    (format.match(/\{\{[0-9]+\}\}/g) || []).some(
      (i, index) => i !== `{{${index + 1}}}`
    )
  ) {
    return {
      valid: false,
      msg: "Invalid parameter ordering",
    };
  }

  if (braceFreeText === bracketFreeText) {
    return { valid: true, msg: "Format seems legit." };
  } else {
    return {
      valid: false,
      msg: "Sample message doesn't match with template format",
    };
  }
}

function validateUrl(value) {
  return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(
    value
  );
}

module.exports = {
  compareFormatAndSample,
  extractParameters,
  validateFormat,
  validateUrl,
};
