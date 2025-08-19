import { Card } from "primereact/card";
import Table from "../../../components/Table/Table";
import { useTranslation } from "react-i18next";

export const WorkOrderDetails = ({ optionsDoc }: any) => {
 
  return (
    <>
      <div className=" grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-2 lg:grid-cols-2">
        <Card className="mt-2">
          <div className="headingConainer">
            <p>{ ("Workorder Documents")}</p>
          </div>
          <Table
            columnTitle={["DOC_NAME", "UPLOADEDBY"]}
            customHeader={["Document Name", "Uploaded By"]}
            columnData={optionsDoc?.workOrderDocList}
            scrollHeight={"200px"}
            downloadColumnHeader={"DOC_NAME"}
          />
        </Card>
        <Card className="mt-2">
          <div className="headingConainer">
            <p>{ ("Asset Related Documents")}</p>
          </div>
          <Table
            columnTitle={["DOC_NAME", "UPLOADEDBY"]}
            customHeader={["Document Name", "Uploaded By"]}
            columnData={optionsDoc?.assetDocList}
            scrollHeight={"200px"}
            downloadColumnHeader={"DOC_NAME"}
          />
        </Card>
      </div>
    </>
  );
};
