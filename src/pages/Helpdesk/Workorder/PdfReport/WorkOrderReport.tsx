import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  TextInput,
} from "@react-pdf/renderer";

import HeaderView from "./HeaderView";
import { createTw } from "react-pdf-tailwind";
import { useEffect, useState } from "react";
import { formateDate } from "../../../../utils/constants";
const WorkOrderReport = ({ pageSize }: any) => {
  const [reportWorkOrder, setReportWorkOrder] = useState<any | null>([]);
  const [workOrderNo, setWorkOrderNo] = useState<any | null>("");
  const [assigneeData, setAssigneeData] = useState<any | null>([]);
  const [workOrderDescription, setWorkOrderDescription] = useState<
    any | null
  >();
  const tw = createTw({
    theme: {
      extend: {
        colors: {
          black: "#272b30",
        },
      },
    },
  });
  const styles = StyleSheet.create({
    page: {
      margin: 0,
      height: "100%",
      width: "100%",
      padding: "24px",
    },
    customStyle: {
      color: "#272B30;", // Custom style example
      fontSize: "12px",
      // fontFamily:"sans-serif"
    },
    assigneeStyle: {
      color: "#272B30",
      fontSize: "8px",
      letterSpacing: "0.15px",
      fontWeight: "bold",
      lineHeight: "12.449px",
    },
    Helper_Text: {
      // font-family: 'Lato', sans-serif !important;
      color: "#7E8083",
      fontSize: "8px",
      // fontFamily: "Lato",
      fontWeight: "bold",
      lineHeight: "12.449px",
      letterSpacing: "0.15px",
    },
    Input_Text: {
      color: "#272B30",
      // fontFamily: "Lato",
      fontSize: "9px",
      fontWeight: "bold",
      lineHeight: "12.449px",
      letterSpacing: "0.15px",
    },
    Input_Text_Header: {
      color: "#272B30",
      // fontFamily: "Lato",
      fontSize: "8px",
      fontWeight: "bold",
      lineHeight: "10.4px",
      letterSpacing: "0.15px",
    },
    Input_HeaderText: {
      color: "#272B30",
      // font-family: 'Lato', sans-serif !important;
      // fontFamily: "Lato",
      fontSize: "12px",
      fontWeight: "bold",
      lineHeight: "21px",
      letterSpacing: "0.15px",
    },
    blackBoxContainer: {
      padding: "7.904px",
      borderRadius: "2.964px",
      border: "1px solid #343434",
      backgroundColor: "#212123",
      color: "#ffffff",
    },

    boxContainer: {
      display: "flex",
      padding: "8px",
      gap: "3.952px",
      alignSelf: "stretch",
      borderRadius: "2.964px",
      border: "1px solid #343434",
    },
    boxTextHeading: {
      fontSize: "9px",
      fontWeight: "bold",
      lineHeight: "12px",
      letterSpacing: "0.074px",
      color: "#272B30",
    },
  });

  const tableData = [
    { Sr: " ", StoreCode: " ", Description: " ", Quantity: " " },
    { Sr: " ", StoreCode: " ", Description: " ", Quantity: " " },
    { Sr: " ", StoreCode: " ", Description: " ", Quantity: "" },
    // { Sr:" ", "StoreCode": " ", Description: "", "Quantity":"" },
    // { Sr:" ", "StoreCode": " ", Description: "", "Quantity":"" },
    // { Sr:" ", "StoreCode": " ", Description: "", "Quantity":"" },
    // { Sr:" ", "StoreCode": " ", Description: "", "Quantity":"" },
    // { Sr:" ", "StoreCode": " ", Description: "", "Quantity":"" },
  ];

  useEffect(() => {
    const workOrderData: any = localStorage.getItem("workDetailsReport");
    const workReportData: any = JSON.parse(workOrderData);
    const technicianData: any =
      localStorage.getItem("TECHNICIAN_LIST") !== null
        ? localStorage.getItem("TECHNICIAN_LIST")
        : "[]";
    const assignee = JSON.parse(technicianData);
    const workReports = {
      Priority: workReportData[0]?.SEVERITY || "",
      "Location Name": workReportData[0]?.LOCATION_DESCRIPTION || "",
      Equipment: workReportData[0]?.ASSET_DESCRIPTION || "",
      Type:
        workReportData[0]?.ASSET_NONASSET === "A"
          ? "Equipment"
          : "Soft Service",
      "Type Of Work": workReportData[0]?.WO_TYPE_NAME || "",
      "Attention To": workReportData[0]?.TEAM_NAME || "",
      Description: workReportData[0]?.DESCRIPTION || "",
      Reporter: workReportData[0]?.RAISED_BY_NAME || "",
      "Reported Date & Time": formateDate(workReportData[0]?.REPORTED_AT) || "",
      "Created Date  & Time":
        formateDate(workReportData[0]?.WO_REPORTED_AT) || "",
    };

    const assigneesDetails = assignee?.map((assign: any) => {
      return {
        name: assign.LOGIN_NAME,
        teamName: workReportData[0]?.TEAM_NAME,
        roleName: assign?.ROLE_NAME,
      };
    });

    setAssigneeData(assigneesDetails);
    setReportWorkOrder([workReports]);
    setWorkOrderNo(workReportData[0]?.WO_NO);
    setWorkOrderDescription(workReportData[0]?.ISSUE_DESCRIPTION);
  }, []);

  return (
    <>
      <Document>
        <Page style={styles.page} size={"A4"}>
          {/* size={{ width: 612, height: 792 }} */}
          <View fixed>
            <HeaderView />
          </View>

          <View style={tw("flex flex-row gap-3 justify-between mb-2.5")}>
            <View
              style={[
                tw("w-4/6 flex flex-row justify-between items-center"),
                styles.blackBoxContainer,
              ]}
            >
              <View
                style={tw(
                  "w-full justify-between flex flex-row items-center pt-3"
                )}
              >
                <Text style={tw("text-xl mb-0")}>Work Order</Text>

                <Text style={tw("font-bold text-lg text-right mb-0")}>
                  {workOrderNo}
                </Text>
              </View>
            </View>

            <View
              style={[
                tw("w-2/6 rounded-md flex items-center justify-center"),
                styles.boxContainer,
              ]}
            >
              <Text style={[tw(""), styles.boxTextHeading]}>
                Printed Date:- {formateDate(new Date().toISOString())}
              </Text>
            </View>
          </View>

          <View style={tw("flex flex-row gap-3 justify-between mb-2.5")}>
            <View
              style={[tw("w-4/6 rounded-md flex-grow"), styles.boxContainer]}
            >
              <Text style={[tw(""), styles.Input_HeaderText]}>
                Work Order Details
              </Text>

              {reportWorkOrder &&
                reportWorkOrder?.map((workOrder: any, index: any) => (
                  <View key={index}>
                    {Object.entries(workOrder).map(([key, value], i) => (
                      <View style={tw(`flex flex-row mb-1.5`)} key={i}>
                        <View style={tw(`w-1/4`)}>
                          <Text
                            style={[tw(""), styles.Helper_Text]}
                          >{`${key.replace(/_/g, " ")}`}</Text>
                        </View>

                        <View style={tw(`w-3/4 `)}>
                          <Text
                            style={[tw(""), styles.Input_Text]}
                          >{`${value}`}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                ))}
            </View>
            <View
              style={[tw("w-2/6 rounded-md flex-grow"), styles.boxContainer]}
            >
              <Text style={[tw(""), styles.Input_HeaderText]}>
                Assignee ({assigneeData?.length})
              </Text>

              {assigneeData.map((assignee: any, index: any) => (
                <View key={index} style={tw(`flex flex-col mb-1.5`)}>
                  <Text style={styles.Input_Text}>{assignee.name}</Text>
                  {/* <Text style={styles.Helper_Text}>({assignee.teamName})</Text> */}
                  <Text style={styles.Helper_Text}>({assignee.roleName})</Text>
                </View>
              ))}
            </View>
          </View>
          {/* <View style={tw("h-2")}></View> */}
          <View style={[tw("w-6/6 rounded-md mb-4"), styles.boxContainer]}>
            <View>
              <Text style={[tw("mb-3"), styles.Input_HeaderText]}>
                Work Analysis & Material
              </Text>
            </View>
            <View style={tw(`flex flex-row mb-2`)}>
              {/* Left Column */}
              <View style={tw(`w-1/6`)}>
                <Text style={styles.Helper_Text}> Cause of problem</Text>
              </View>

              {/* Right Column */}
              <View style={tw(`w-5/6 `)}>
                <Text style={styles.Input_Text}>{workOrderDescription}</Text>
              </View>
            </View>
            <View style={tw(`flex flex-row mb-2`)}>
              {/* Left Column */}
              <View style={tw(`w-1/6`)}>
                <Text style={styles.Helper_Text}> Spares Used</Text>
              </View>

              {/* Right Column */}
              <View style={tw(`w-5/6 border-b border-gray-800`)}>
                <Text style={styles.Input_Text}>
                  {/* ------------------------------------------------------------------------------------ */}
                </Text>
              </View>
            </View>
            <View style={tw(`flex flex-row mb-2`)}>
              {/* Left Column */}
              <View style={tw(`w-1/6`)}>
                <Text style={styles.Helper_Text}> Resolution Description</Text>
              </View>

              {/* Right Column */}
              <View style={tw(`w-5/6 border-b border-gray-800`)}>
                <Text style={styles.Input_Text}>
                  {/* ------------------------------------------------------------------------------------ */}
                </Text>
              </View>
            </View>
            <View style={tw(`flex flex-row mb-2`)}>
              {/* Left Column */}
              <View style={tw(`w-1/6`)}>
                <Text style={styles.Helper_Text}> Part Replaced</Text>
              </View>

              {/* Right Column */}
              <View style={tw("w-5/6")}>
                <View style={tw("")}>
                  {/* Table Header */}
                  <View style={tw("flex flex-row")}>
                    <Text
                      style={[
                        tw("w-1/4 p-2 border border-gray-400 text-left"),
                        styles.Input_Text_Header,
                      ]}
                    >
                      Sr No
                    </Text>
                    <Text
                      style={[
                        tw("w-1/4 p-2 border border-gray-400 text-left"),
                        styles.Input_Text_Header,
                      ]}
                    >
                      Store Code
                    </Text>
                    <Text
                      style={[
                        tw("w-1/4 p-2 border border-gray-400 text-left"),
                        styles.Input_Text_Header,
                      ]}
                    >
                      Description
                    </Text>
                    <Text
                      style={[
                        tw("w-1/4 p-2 border border-gray-400 text-left"),
                        styles.Input_Text_Header,
                      ]}
                    >
                      Quantity
                    </Text>
                  </View>

                  {/* Table Rows */}
                  {tableData.map((row, index) => (
                    <View key={index} style={tw("flex flex-row")}>
                      <Text
                        style={[
                          tw("w-1/4 p-1 border border-gray-400 text-left"),
                          { minHeight: 10, flexWrap: "wrap" },
                          styles.Input_Text,
                        ]}
                      >
                        {row.Sr}
                      </Text>
                      <Text
                        style={[
                          tw("w-1/4 p-1 border border-gray-400 text-left"),
                          styles.Input_Text,
                        ]}
                      >
                        {row.StoreCode}
                      </Text>
                      <Text
                        style={[
                          tw("w-1/4 p-1 border border-gray-400 text-left"),
                          styles.Input_Text,
                        ]}
                      >
                        {row.Description}
                      </Text>
                      <Text
                        style={[
                          tw("w-1/4 p-1 border border-gray-400 text-left"),
                          styles.Input_Text,
                        ]}
                      >
                        {row.Quantity}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>
          {/* <View style={tw("h-10")}></View> */}
          <View style={tw("flex flex-row gap-3 mb-2.5")}>
            <View style={[tw(`w-1/3 h-20 text-left`), styles.boxContainer]}>
              <Text style={[tw(` text-left`), styles.Input_Text]}>
                Technician Assign By
              </Text>
            </View>
            <View style={[tw(`w-1/3 h-20 text-left`), styles.boxContainer]}>
              <Text style={[tw(` text-left`), styles.Input_Text]}>
                Technician Assign
              </Text>
            </View>
            <View style={[tw(`w-1/3 h-20 text-left`), styles.boxContainer]}>
              <Text style={[tw(` text-left`), styles.Input_Text]}>
                Date/Time
              </Text>
            </View>

            {/* First Text box */}
            {/* <Text style={tw("absolute text-sm text-gray-500 left-4 top-2")}>
              Label
            </Text>
            <TextInput style={tw("border  w-1/3 rounded mr-2 h-16")} /> */}

            {/* Second Text box
            <Text style={tw("absolute text-sm text-gray-500 left-4 top-2")}>
              Label
            </Text>
            <TextInput style={tw("border  w-1/3 rounded mr-2 h-16")} />

            Third Text box
            <Text style={tw("absolute text-sm text-gray-500 left-4 top-2")}>
              Label
            </Text>
            <TextInput style={tw("border  w-1/3 rounded mr-2 h-16")} /> */}
          </View>
          <View style={[tw(` rounded-md`), styles.boxContainer]}>
            <Text style={styles.assigneeStyle}>
              This document is RESTRICTED and shall not be lent to or copied by
              any person without authorization from the Management of Keppel
              Seghers Engineering Singapore Pte Ltd. A retained printed paper
              version may not be the latest version staff can verify on the
              latest version from KLIK+FM
            </Text>
          </View>

          <View
            fixed
            style={{
              position: "absolute",
              bottom: 10, // Position 10 units from bottom
              left: 0,
              right: 0,
              top: "auto",
              textAlign: "center",
              borderTop: "1 solid black",
              paddingTop: 5,
            }}
          >
            <Text style={styles.customStyle}> Keppel CMMS</Text>
          </View>
        </Page>
      </Document>
    </>
  );
};

export default WorkOrderReport;
