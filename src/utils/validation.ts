export const validation: any = {
  NonZeroNumber: (fieldValue: any, fieldName: any, setValue: any) => {
    var msgtext = "";
    const sanitizedValue = fieldValue?.toString()?.replace(/[^0]/g, "");
    if (sanitizedValue === 0) {
      msgtext = "Please fill the required fields";
      setValue(fieldName, 0);
    } else {
      setValue(fieldName, sanitizedValue);
    }
    return msgtext;
  },
  onlyNumber: (fieldValue: any, fieldName: any, setValue: any) => {
    const sanitizedValue = fieldValue?.toString()?.replace(/[^0-9]/g, "");
    setValue(fieldName, sanitizedValue);
    return true;
  },
  onlyHours: (fieldValue: any, fieldName: any, setValue: any) => {
    const sanitizedValue = fieldValue?.toString()?.replace(/[^0-9]/g, "");
    if (sanitizedValue >= 25 || sanitizedValue < 0) {
      setValue(fieldName, "24");
    } else {
      setValue(fieldName, sanitizedValue);
    }
    return true;
  },
  onlyDay: (fieldValue: any, fieldName: any, setValue: any) => {
    const sanitizedValue = fieldValue?.toString()?.replace(/[^0-9]/g, "");
    if (sanitizedValue >= 31 || sanitizedValue < 0) {
      setValue(fieldName, "31");
    } else {
      setValue(fieldName, sanitizedValue);
    }
    return true;
  },
  onlyMonth: (fieldValue: any, fieldName: any, setValue: any) => {
    const sanitizedValue = fieldValue?.toString()?.replace(/[^0-9]/g, "");
    if (sanitizedValue >= 12 || sanitizedValue < 0) {
      setValue(fieldName, "12");
    } else {
      setValue(fieldName, sanitizedValue);
    }
    return true;
  },
  onlyWeek: (fieldValue: any, fieldName: any, setValue: any) => {
    const sanitizedValue = fieldValue?.toString()?.replace(/[^0-9]/g, "");
    if (sanitizedValue >= 5 || sanitizedValue < 0) {
      setValue(fieldName, "5");
    } else {
      setValue(fieldName, sanitizedValue);
    }
    return true;
  },
  phoneNumber: (fieldValue: any, fieldName: any, setValue: any) => {
    const sanitizedValue = fieldValue?.toString()?.replace(/^[+]{1}(?:[0-9\-\\/.]\s?){6,20}[0-9]{1}$/, "");
    setValue(fieldName, sanitizedValue);

    if (sanitizedValue > 6 && sanitizedValue < 16) {
      return "Invalid Phone Number";
    }
    return true;
  },
  phoneWithInternationNumber: (fieldValue: any, fieldName: any, setValue: any) => {
    // const sanitizedValue = fieldValue.trim();

    const sanitizedValue = fieldValue?.toString()?.replace(/[^\d+]/g, "");
    setValue(fieldName, sanitizedValue);

    // if (sanitizedValue?.length < 6 || sanitizedValue?.length > 16) {
    //   return "Invalid Phone Number";
    // }
    return true

  },
  onlyPhoneWithInternationNumber: (fieldValue: any, fieldName: any, setValue: any) => {
    // const sanitizedValue = fieldValue.trim();
    if (fieldValue === undefined || fieldValue === null) return true;
    const sanitizedValue = fieldValue?.toString()?.replace(/[^\d+]/g, "");
    setValue(fieldName, sanitizedValue);

    // if (sanitizedValue?.length < 6 || sanitizedValue?.length > 16) {
    //   return "Invalid Phone Number";
    // }
    return true

  },
  mobileNumber: (fieldValue: any, fieldName: any, setValue: any) => {
    const sanitizedValue = fieldValue?.toString()?.replace(/[^0-9]/g, "");
    setValue(fieldName, sanitizedValue);

    if (fieldValue.length < 8 || fieldValue.length > 12) {
      return "Invalid Mobile Number";
    }
    return true;
  },
  onlyAlphabet: (fieldValue: any, fieldName: any, setValue: any) => {
    if (fieldValue === undefined || fieldValue === null) return true;

    const strValue = fieldValue.toString();
    const sanitizedValue = strValue.replace(/[^a-zA-Z]/g, "");
    if (sanitizedValue !== strValue) {
      setValue(fieldName, sanitizedValue);
    }

    return sanitizedValue === strValue
      ? true
      : "Only alphabetic characters are allowed.";
  },


  //input accept only like xyz123 this format
  onlyfirstAlphaNumeric: (fieldValue: any, fieldName: any, setValue: any) => {
    if (fieldValue === undefined || fieldValue === null) return true;
    const strValue = fieldValue.toString();
    const startsWithAlphaRegex = /^[a-zA-Z]/;

    const validFormatRegex = /^[a-zA-Z]\d*$/;
    if (!startsWithAlphaRegex.test(strValue)) {
      const sanitizedValue = strValue.replace(/[^a-zA-Z]/g, "");
      setValue(fieldName, sanitizedValue);
      return "Input must start with a letter.";
    }
    if (validFormatRegex.test(strValue)) {
      return true;
    } else {
      const sanitizedValue = strValue.replace(/[^a-zA-Z0-9]/g, "");
      setValue(fieldName, sanitizedValue);
      return "Only alphabetic and numeric values allowed, starting with a letter.";
    }
  },


  onlyAlphaNumeric: (fieldValue: any, fieldName: any, setValue: any) => {
    if (fieldValue === undefined || fieldValue === null) return true;

    const strValue = fieldValue.toString();
    const sanitizedValue = strValue.replace(/[^a-zA-Z0-9 ]/g, "");
    if (sanitizedValue !== strValue) {
      setValue(fieldName, sanitizedValue);
    }
    return sanitizedValue === strValue
      ? true
      : "Only alphabetic & Numeric value allowed.";
  },

  onlyAlphaNumericWhiteSpace: (fieldValue: any, fieldName: any, setValue: any) => {
    if (fieldValue === undefined || fieldValue === null) return true;

    const strValue = fieldValue.toString();
    // Update the regex to allow spaces as well
    const sanitizedValue = strValue.replace(/[^a-zA-Z0-9 ]/g, ""); // note the added space in the regex
    if (sanitizedValue !== strValue) {
      setValue(fieldName, sanitizedValue);
    }

    return sanitizedValue === strValue
      ? true
      : "Only alphabetic, numeric, and space characters are allowed.";
  },


  onlyPhoneNumber: (fieldValue: any, fieldName: any, setValue: any) => {
    if (fieldValue === undefined || fieldValue === null) return true;
    const sanitizedValue = fieldValue?.toString()?.replace(/[^0-9]/g, "");
    setValue(fieldName, sanitizedValue);

    if (fieldValue.length < 8 || fieldValue.length > 12) {
      return "Invalid Phone Number";
    }


  },
};
