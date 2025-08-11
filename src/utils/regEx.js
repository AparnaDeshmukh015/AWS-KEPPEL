export const PHONE_REGEX = /^[6789]\d{9}$/;
export const EMAIL_REGEX = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,20}$/;
//export const ALPHABATE_REGEX = /^[/s a-z A-Z]+$/;
export const ALPHABATE_WITHOUT_WHITESPACE_REGEX = /[^-\s][a-zA-Z\\s]+$/;
// export const ALPHABATE_WITHOUT_WHITESPACE_REGEX = /^[A-Za-z]+$/;
export const NUMBER_REGEX = /^[0-9\b]+$/;
export const NUMBER_WITH_COMMA_REGEX = /^[0-9,\b]+$/;
export const DATE_REGEX = /^(\d{1,2})-(\d{1,2})-(\d{4})$/;
export const HOURS_REGEX = /^(?:[0-1]?[0-9]|2[0-3])$/;
export const MIN_REGEX = /\b([0-5]?[0-9])\b/;
export const ALPHABATE_WITH_COMMA_REGEX = /^[a-zA-Z,]+$/;
export const MONTH_REGEX = /^(0?[0-9]|1[0-2])$/;
export const PERCENTAGE_REGEX = /^(?:\d{1,2}(?:\.\d{1,2})?|100(?:\.00?)?)$/;
export const URL_REGEX = /^(https?:\/\/)?([a-z]+\.)?linkedin\.com\/(?:in|pub)\/[a-zA-Z0-9_-]+\/?$/i;
export const SKILLS_REGEX = /^(?!^[0-9]+$)[a-zA-Z ,]+(?:[_@][a-zA-Z0-9]+)*(?:\s[a-zA-Z0-9]+(?:[_@][a-zA-Z0-9]+)*)*$/;
export const JOB_TITLE_REGEX = /^(?:(?![\d!@#$%^&*()_+={}[\]:;<>,.?/~\\-])\S|(?! {2}).)+$/;
export const QUESTION_REGEX = /^(?![0-9]+$)(?![!@#$%^&*(),.?":{}|<>_+=\[\];/'\\-]+$).+/;
export const PINCODE_REGEX = /^\d{6}$/;
export const ALPHA_NUMERIC = /^[a-zA-Z0-9]+$/
export const ALPHA_NUMERIC_WITH_SPACE = /^[a-zA-Z0-9 ]+$/
export const NUMBER_WITHOUT_ALPHABET = /[^0-9]/g