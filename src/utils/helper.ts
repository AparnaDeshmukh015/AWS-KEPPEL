import * as xlsx from "xlsx";
import FileSaver from 'file-saver';

export const ExportCSV = (csvData:any,fileName:any, roleName?:any) => {
    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
     const fileExtension = '.xlsx';
     const ws = xlsx.utils.json_to_sheet(csvData);
     const wb = { Sheets: { [roleName]: ws }, SheetNames: [roleName] };
     const excelBuffer = xlsx.write(wb, { bookType: 'xlsx', type: 'array' });
     const data = new Blob([excelBuffer], { type: fileType });
     FileSaver.saveAs(data, fileName + fileExtension);
  }

  export const base64ToFile = async(base64:any) => {
    const res = await fetch(base64)
    const buf = await res.arrayBuffer()
    var blob = new Blob([buf], {type: 'image/bmp'});
   
    return blob;
  };
  