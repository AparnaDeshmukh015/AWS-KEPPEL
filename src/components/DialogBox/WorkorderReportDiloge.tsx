import React, { useState, useRef } from 'react'
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button"
//import html2canvas from 'html2canvas';
// import jsPDF from 'jspdf';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { RadioButton } from 'primereact/radiobutton';
interface Task {
  TaskName: string;
  TechnicianName: string;
  Time: string;
  Remark: string;
}
interface Part {
  SrNo: string;
  Partcode: string;
  Partname: string;
  Stock: string;
  UsedQuantity: string;
  UOM: string;
}
interface Material {
  RequestNo: string;
  PartCode: string;
  PartName: string;
  RequestedQuantity: string;
  IssuedQuantity: string;
}
interface WorkorderHistory {
  Date: string;
  workorderstatus: string;
  actionBy: string;
  redirectUser: string;
  remarks: string;
}


const WorkOrderReport = ({
  workOrderReport,
  label,
  header

}: any) => {
  const [visible, setVisible] = useState<boolean>(false);
  const [task, settask] = useState<Task[]>([]);
  const [material, setmaterial] = useState<Material[]>([]);
  const [part, setpart] = useState<Part[]>([]);
  const [workOrder, setworkOrder] = useState<WorkorderHistory[]>([]);
 
  const headingStyle = {
    fontWeight: 600,
    width: "50%",
    fontSize: "13px",
    display: "inline-block",
    color: "black"
  }
  const valueStyle = {
    fontWeight: 500,
    width: "50%",
    fontSize: "12px",
    display: "inline-block",
    color: "black"
  }
  const pdfRef = useRef(null);
  const handleDownloadPdf = () => {
    const input = pdfRef.current;
    if (input) {
      // html2canvas(input).then((canvas) => {
      //   const imgData = canvas.toDataURL('image/png');
      //   const pdf = new jsPDF('p', 'mm', 'a4', true);
      //   const pdfWidth = pdf.internal.pageSize.getWidth();
      //   const pdfHeight = pdf.internal.pageSize.getHeight();
      //   const imgWidth = canvas.width;
      //   const imgHeight = canvas.height;
      //   const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      //   const imgX = (pdfWidth - imgWidth * ratio) / 2;
      //   const imgY = 40;
      //   pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      //   pdf.save('WorkOrderReport.pdf');
      // });
    }
  }
  return (
    <>
      <div className="flex justify-content-center">
        <Button
          className="WO_Button mr-2"
          label={label} onClick={() => setVisible(true)} />
        <Dialog header={header} className='flex justify-content-center'
          visible={visible} style={{ width: '60vw' }}
          onHide={() => { if (!visible) return; setVisible(false); }}>
          <div id="content" ref={pdfRef} className='flex flex-wrap justify-around' >
            <div className="flex-2 w-50">
              <div>
                <span style={headingStyle}>Work Order No:</span>
                < span style={valueStyle}>{workOrderReport?.workOrderDetails?.WO_NO}</span>
              </div>
              <div>
                <span style={headingStyle}>Work Order Type :</span>
                <span style={valueStyle}>{workOrderReport?.workOrderDetails?.WO_TYPE}</span>
              </div>
              <div>
                <span style={headingStyle}>Raised By:</span>
                <span style={valueStyle}>{workOrderReport?.workOrderDetails?.USER_NAME}</span>
              </div>
              <div>
                <span style={headingStyle}>Location :</span>
                <span style={valueStyle}>{workOrderReport?.workOrderDetails?.LOCATION_NAME}</span>
              </div>
              <div>
                <span style={headingStyle}>Asset Name :</span>
                < span style={valueStyle}>{workOrderReport?.workOrderDetails?.ASSET_NAME}</span>
              </div>
              <div >
                <span style={headingStyle}>Request Title :</span>
                <span style={valueStyle}>{workOrderReport?.workOrderDetails?.REQ_DESC}</span>
              </div>

              <div>
                <span style={headingStyle}>Digital Sign :</span>
                <div ><img src={`data:image/png;base64,${workOrderReport?.digitalSign?.DOC_DATA}`} /></div>
              </div>
            </div>
            <div className="flex-2 w-50 " >
              <div>
                <span style={headingStyle}>Discription:</span>
                < span style={valueStyle}>{workOrderReport?.workOrderDetails?.WO_REMARKS}</span>
              </div>
              <div>
                <span style={headingStyle}>Severity :</span>
                <span style={valueStyle}>{workOrderReport?.workOrderDetails?.SEVERITY_DESC}</span>
              </div>
              {/* <div>
                <span>spanriority :</span>
                <span>High</span>
              </div> */}
              <div>
                <span style={headingStyle}>Team :</span>
                <span style={valueStyle}>{workOrderReport?.workOrderDetails?.TEAM_NAME}</span>
              </div>
              <div>
                <span style={headingStyle}>Technician Name :</span>
                <span style={valueStyle}>{workOrderReport?.workOrderDetails?.TECH_NAME}</span>
              </div>
              <div>
                <span style={headingStyle}>Raised On :</span>
                < span style={valueStyle}>{workOrderReport?.workOrderDetails?.WO_DATE}</span>
              </div>
            </div>
            <div className="card">
              <DataTable value={task} tableStyle={{ minWidth: '50rem' }} header="Task Details">
                <Column field="TaskName" header="TaskName"></Column>
                <Column field="TechnicianName" header="Technician Name"></Column>
                <Column field="Time" header="Time" ></Column>
                <Column field="Remark" header="Remark"></Column>
              </DataTable>
            </div>

            <div className="card">
              <DataTable value={part} tableStyle={{ minWidth: '50rem' }} header="Part Details">
                {/* <div className="flex align-items-center">
                  <RadioButton inputId="" name="Self" value="" />
                  <label htmlFor="ingredient2" className="ml-2">Self</label>
                </div>
                <div className="flex align-items-center">
                  <RadioButton inputId="" name="self" value="" />
                  <label htmlFor="" className="ml-2">Against Work Order</label>
                </div> */}
                <Column field="SrNo" header="Sr No"></Column>
                <Column field="PartCode" header="Part Code"></Column>
                <Column field="PartName" header="Part Name" ></Column>
                <Column field="Stock" header="Stock"></Column>
                <Column field="UsedQuantity" header="Used Quantity"></Column>
                <Column field="UOM" header="UOM"></Column>
              </DataTable>
            </div>

            <div className="card">
              <DataTable value={material} tableStyle={{ minWidth: '50rem' }} header="Material request">
                <Column field="RequestNo" header="Request No"></Column>
                <Column field="PartCode" header="Part Code"></Column>
                <Column field="PartName" header="Part Name" ></Column>
                <Column field="RequestedQuantity" header="Requested Quantity"></Column>
                <Column field="IssuedQuantity" header="Issued Quantity"></Column>
              </DataTable>
            </div>

            <div className="card">
              <DataTable value={workOrder} tableStyle={{ minWidth: '50rem' }} header="Work Order History">
                <Column field="Date" header="Date & Time"></Column>
                <Column field="workorderstatus" header="Work Order status"></Column>
                <Column field="actionBy" header="Action By" ></Column>
                <Column field="redirectUser" header="Redirect User"></Column>
                <Column field="remarks" header="Remarks"></Column>
              </DataTable>
            </div>
          </div>
          <Button onClick={handleDownloadPdf}
            className="Primary_Button"
            label='Download'
          />

        </Dialog>
      </div>

    </>

  )
}
export default WorkOrderReport