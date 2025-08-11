import * as excelJs from "exceljs";
import * as xlsx from "xlsx";
import { saveAs } from "file-saver";
import { callPostAPI } from "../../services/apis";
import { ENDPOINTS } from "../../utils/APIEndpoints";
import { toast } from "react-toastify";



const TemplateDownload = (
  headerdata: any,
  dropdowndata: any,
  fileName: string,
  noOfRows?: number,
  // downloadData?: boolean
) => {
  let excelkey = [
    { key: 1, value: "A" },
    { key: 2, value: "B" },
    { key: 3, value: "C" },
    { key: 4, value: "D" },
    { key: 5, value: "E" },
    { key: 6, value: "F" },
    { key: 7, value: "G" },
    { key: 8, value: "H" },
    { key: 9, value: "I" },
    { key: 10, value: "J" },
    { key: 11, value: "K" },
    { key: 12, value: "L" },
    { key: 13, value: "M" },
    { key: 14, value: "N" },
    { key: 15, value: "O" },
    { key: 16, value: "P" },
    { key: 17, value: "Q" },
    { key: 18, value: "R" },
    { key: 19, value: "S" },
    { key: 20, value: "T" },
    { key: 21, value: "U" },
    { key: 22, value: "V" },
    { key: 23, value: "W" },
    { key: 24, value: "X" },
    { key: 25, value: "Y" },
    { key: 26, value: "Z" },
    { key: 27, value: "AA" },
    { key: 28, value: "AB" },
    { key: 29, value: "AC" },
    { key: 30, value: "AD" },
    { key: 31, value: "AE" },
    { key: 32, value: "AF" },
    { key: 33, value: "AG" },
    { key: 34, value: "AH" },
    { key: 35, value: "AI" },
    { key: 36, value: "AJ" },
    { key: 37, value: "AK" },
    { key: 38, value: "AL" },
    { key: 39, value: "AM" },
    { key: 40, value: "AN" },
  ];
  let excelheaders = [
    { key: 1, value: "A1" },
    { key: 2, value: "B1" },
    { key: 3, value: "C1" },
    { key: 4, value: "D1" },
    { key: 5, value: "E1" },
    { key: 6, value: "F1" },
    { key: 7, value: "G1" },
    { key: 8, value: "H1" },
    { key: 9, value: "I1" },
    { key: 10, value: "J1" },
    { key: 11, value: "K1" },
    { key: 12, value: "L1" },
    { key: 13, value: "M1" },
    { key: 14, value: "N1" },
    { key: 15, value: "O1" },
    { key: 16, value: "P1" },
    { key: 17, value: "Q1" },
    { key: 18, value: "R1" },
    { key: 19, value: "S1" },
    { key: 20, value: "T1" },
    { key: 21, value: "U1" },
    { key: 22, value: "V1" },
    { key: 23, value: "W1" },
    { key: 24, value: "X1" },
    { key: 25, value: "Y1" },
    { key: 26, value: "Z1" },
    { key: 27, value: "AA1" },
    { key: 28, value: "AB1" },
    { key: 29, value: "AC1" },
    { key: 30, value: "AD1" },
    { key: 31, value: "AE1" },
    { key: 32, value: "AF1" },
    { key: 33, value: "AG1" },
    { key: 34, value: "AH1" },
    { key: 35, value: "AI1" },
    { key: 36, value: "AJ1" },
    { key: 37, value: "AK1" },
    { key: 38, value: "AL1" },
    { key: 39, value: "AM1" },
    { key: 40, value: "AN1" },
  ];

  var sendjsondata = headerdata;
  var j_data = dropdowndata;
  convert_excel_base64(sendjsondata, noOfRows ?? 20000, j_data);
  function convert_excel_base64(data: any, generate_rows = 20000, j_data: any) {
    var workbook = new excelJs.Workbook();
    var worksheet = workbook.addWorksheet("Sheet1");

    let headercount = 0;

    var arrData = typeof data != "object" ? JSON.parse(data) : data;

    for (let i = 0; i < generate_rows; i++) {
      if (i === 0) {
        let array = [];
        let ary = {};
        for (var arrDataIndex in arrData[0]) {
          ary = {
            header: arrDataIndex,
            key: arrDataIndex,
          };
          array.push(ary);
          headercount++;
        }
        worksheet.columns = array;
      }

      let arrayDetail = [];
      let j1 = 1;
      for (let indexArrData in arrData[0]) {
        if (typeof arrData[0][indexArrData] == "object") {
          arrayDetail[j1] = "";
        } else {
          arrayDetail[j1] = arrData[0][indexArrData];
        }

        j1++;
      }

      worksheet.addRow(arrayDetail);
    }

    for (let i = 0; i < generate_rows; i++) {
      let j2 = 1;

      for (var index_arrData in arrData[0]) {
        if (typeof arrData[0][index_arrData] == "object") {
          var c = [];

          c.push(arrData[0][index_arrData][0]);

          var a = excelkey[j2 - 1].value + (i + 2);

          worksheet.getCell(a).dataValidation = {
            type: "list",
            allowBlank: true,
            formulae: c,
          };
        }
        j2++;
      }
    }

    let fromval = excelheaders[0].value;
    let toval = excelheaders[headercount - 1].value;
    worksheet.autoFilter = {
      from: fromval,
      to: toval,
    };

    for (let i = 0; i < j_data.length; i++) {
      var worksheet_new = workbook.addWorksheet(j_data[i].sheet);
      worksheet_new.state = "hidden";
      let headercount = 0;
      let arrData =
        typeof j_data[i].data != "object"
          ? JSON.parse(j_data[i].data)
          : j_data[i].data;
      for (var k = 0; k < arrData.length; k++) {
        if (k === 0) {
          let array = [];
          let ary = {};
          for (var index2 in arrData[0]) {
            ary = {
              header: index2,
              key: index2,
            };

            array.push(ary);
            headercount++;
          }
          worksheet_new.columns = array;
        }

        var array_Detail = [];
        let j = 1;
        for (var index4 in arrData[k]) {
          array_Detail[j] = arrData[k][index4];
          j++;
        }
        worksheet_new.addRow(array_Detail);
      }
    }

    let tempfilename = fileName + ".xlsx";
    var tempFilePath = "D:\\" + tempfilename;
    workbook.xlsx.writeBuffer().then((buffer) => {
      saveAs(
        new Blob([buffer], { type: "application/octet-stream" }),
        tempFilePath
      );
    });
  }
};


const upploadexceljson: any = async (
  jsonarray: any,
  columnheader: string,
  columnlength: number,
  function_code: string
) => {
  try {
    const blankProperties: any = [];

    for (const obj of jsonarray) {
      for (const key in obj) {
        if (obj[key] !== "") {
          blankProperties.push(obj);
          break;
        }
      }
    }
    const payload = {
      isExcelUpload: 1,
      data: blankProperties,
      col_length: columnlength,
      col_headers: columnheader,
      verify_type: "upload",
      ASSETTYPE:
        function_code === "AS004" ? "A" : function_code === "AS006" ? "N" : "",
    };

    const res = await callPostAPI(
      ENDPOINTS.UPLOADEXCELDATACOMMON,
      payload,
      function_code
    );

    if (res) {
      if (function_code === "AS0015") {
        await callPostAPI(ENDPOINTS.UPDATE_HIERARCHY_LIST)
      }
    }
    return res;
  } catch (error: any) {
    toast.error(error);
  }
};
const readUploadFile = (e: any, function_code: any, setVisible: any) => {


  return new Promise(async (resolve, reject) => {
    if (e.files) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = e.target?.result;

        const workbook = xlsx.read(data, { type: "binary", cellText: false, cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const json = xlsx.utils.sheet_to_json(worksheet, { header: 0, raw: false, dateNF: 'DD-MM-YYYY', defval: " " });
        const cleanedJson = json.map((row: any) => {
          const cleanRow: any = {};
          for (const [key, value] of Object.entries(row)) {
            // Skip __EMPTY columns and keep only columns with real names
            if (!key.startsWith('__EMPTY')) {
              cleanRow[key] = value;
            }
          }
          return cleanRow;
        });

        // Then filter rows that have at least one non-empty value
        const filteredJson = cleanedJson.filter(row =>
          Object.values(row).some(val => val?.toString().trim() !== "")
        );

        if (filteredJson.length === 0) {
          toast.error("Excel file has no valid data.")
          reject(new Error("Excel file has no valid data."));
          return;
        }

        const columnheader = Object.keys(filteredJson[0]!);
        columnheader.join();

        try {
          const response = await upploadexceljson(
            filteredJson,
            columnheader.join(),
            columnheader.length,
            function_code
          );


          setVisible(false);

          resolve(response);
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsArrayBuffer(e.files[0]);
    }
  });
};

// Building Setup template Download code here

const TemplateBuildingDownload = (
  headerdata: any,
  dropdowndata: any,
  fileName: string
) => {
  let excelkey = [
    { key: 1, value: "A" },
    { key: 2, value: "B" },
    { key: 3, value: "C" },
    { key: 4, value: "D" },
    { key: 5, value: "E" },
    { key: 6, value: "F" },
    { key: 7, value: "G" },
    { key: 8, value: "H" },
    { key: 9, value: "I" },
    { key: 10, value: "J" },
    { key: 11, value: "K" },
    { key: 12, value: "L" },
    { key: 13, value: "M" },
    { key: 14, value: "N" },
    { key: 15, value: "O" },
    { key: 16, value: "P" },
    { key: 17, value: "Q" },
    { key: 18, value: "R" },
    { key: 19, value: "S" },
    { key: 20, value: "T" },
    { key: 21, value: "U" },
    { key: 22, value: "V" },
    { key: 23, value: "W" },
    { key: 24, value: "X" },
    { key: 25, value: "Y" },
    { key: 26, value: "Z" },
    { key: 27, value: "AA" },
    { key: 28, value: "AB" },
    { key: 29, value: "AC" },
    { key: 30, value: "AD" },
    { key: 31, value: "AE" },
    { key: 32, value: "AF" },
    { key: 33, value: "AG" },
    { key: 34, value: "AH" },
    { key: 35, value: "AI" },
    { key: 36, value: "AJ" },
    { key: 37, value: "AK" },
    { key: 38, value: "AL" },
    { key: 39, value: "AM" },
    { key: 40, value: "AN" },
  ];
  let excelheaders = [
    { key: 1, value: "A1" },
    { key: 2, value: "B1" },
    { key: 3, value: "C1" },
    { key: 4, value: "D1" },
    { key: 5, value: "E1" },
    { key: 6, value: "F1" },
    { key: 7, value: "G1" },
    { key: 8, value: "H1" },
    { key: 9, value: "I1" },
    { key: 10, value: "J1" },
    { key: 11, value: "K1" },
    { key: 12, value: "L1" },
    { key: 13, value: "M1" },
    { key: 14, value: "N1" },
    { key: 15, value: "O1" },
    { key: 16, value: "P1" },
    { key: 17, value: "Q1" },
    { key: 18, value: "R1" },
    { key: 19, value: "S1" },
    { key: 20, value: "T1" },
    { key: 21, value: "U1" },
    { key: 22, value: "V1" },
    { key: 23, value: "W1" },
    { key: 24, value: "X1" },
    { key: 25, value: "Y1" },
    { key: 26, value: "Z1" },
    { key: 27, value: "AA1" },
    { key: 28, value: "AB1" },
    { key: 29, value: "AC1" },
    { key: 30, value: "AD1" },
    { key: 31, value: "AE1" },
    { key: 32, value: "AF1" },
    { key: 33, value: "AG1" },
    { key: 34, value: "AH1" },
    { key: 35, value: "AI1" },
    { key: 36, value: "AJ1" },
    { key: 37, value: "AK1" },
    { key: 38, value: "AL1" },
    { key: 39, value: "AM1" },
    { key: 40, value: "AN1" },
  ];

  var sendjsondata = headerdata;
  var j_data = dropdowndata;
  convert_excel_base64(sendjsondata, 20000, j_data);
  function convert_excel_base64(data: any, generate_rows = 20000, j_data: any) {
    var workbook = new excelJs.Workbook();
    var worksheet = workbook.addWorksheet("Sheet1");
    let headercount = 0;
    var arrData = typeof data != "object" ? JSON.parse(data) : data;
    //let dropdown = [];

    for (let i = 0; i < generate_rows; i++) {
      if (i === 0) {
        let array = [];
        let ary = {};
        for (var index5 in arrData[0]) {
          ary = {
            header: index5,
            key: index5,
          };
          array.push(ary);
          headercount++;
        }
        worksheet.columns = array;
      }

      let arrayDetail = [];
      let j = 1;
      for (let index6 in arrData[0]) {
        if (typeof arrData[0][index6] == "object") {
          //dropdown = arrData[0][index6];
          arrayDetail[j] = "";
        } else {
          arrayDetail[j] = ""; //arrData[0][index];
        }
        j++;
      }
      worksheet.addRow(arrayDetail);
    }

    for (let i = 0; i < generate_rows; i++) {
      //var arrayDetail = [];
      let j = 1;

      for (var index1 in arrData[0]) {
        if (typeof arrData[0][index1] == "object") {
          var c = [];

          c.push(arrData[0][index1][0]);

          var a = excelkey[j - 1].value + (i + 2);

          worksheet.getCell(a).dataValidation = {
            type: "list",
            allowBlank: true,
            formulae: c,
          };

        }

        //added by Anand
        if (i !== 0 && i < arrData.length) {
          var a1 = excelkey[j - 1].value + (i + 1);
          if (i <= arrData.length) {
            if ((index1 !== "Asset Folder ID") && (index1 !== "Location ID")) {
              worksheet.getCell(a1).value = arrData[i][index1];
            } else {
              worksheet.getCell(a1).value = "";
            }
          }
        }
        j++;
      }
    }

    let fromval = excelheaders[0].value;
    let toval = excelheaders[headercount - 1].value;
    worksheet.autoFilter = {
      from: fromval,
      to: toval,
    };

    for (let i = 0; i < j_data.length; i++) {
      var worksheet_new = workbook.addWorksheet(j_data[i].sheet);
      worksheet_new.state = "hidden";
      //let headercount = 0;
      let arrData =
        typeof j_data[i].data != "object"
          ? JSON.parse(j_data[i].data)
          : j_data[i].data;
      for (var k = 0; k < arrData.length; k++) {
        if (k === 0) {
          let array = [];
          let ary = {};
          for (var index in arrData[0]) {
            ary = {
              header: index,
              key: index,
            };

            array.push(ary);

          }
          worksheet_new.columns = array;
        }

        var array_Detail = [];
        var j = 1;
        for (var index3 in arrData[k]) {
          array_Detail[j] = arrData[k][index3];
          j++;
        }
        worksheet_new.addRow(array_Detail);
      }
    }

    let tempfilename = fileName + ".xlsx";
    workbook.xlsx.writeBuffer().then((buffer) => {
      saveAs(
        new Blob([buffer], { type: "application/octet-stream" }),
        tempfilename
      );
    });
  }
};

export {
  TemplateDownload,
  readUploadFile,
  upploadexceljson,
  TemplateBuildingDownload,
};
