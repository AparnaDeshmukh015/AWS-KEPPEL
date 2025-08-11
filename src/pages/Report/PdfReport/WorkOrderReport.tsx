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
const WorkOrderReport = ({ pageSize }: any) => {
  const [reportWorkOrder, setReportWorkOrder] = useState<any | null>([]);
  const [workOrderNo, setWorkOrderNo] = useState<any | null>("")
  const [assigneeData, setAssigneeData] = useState<any | null>([]);
  const [workOrderDescription, setWorkOrderDescription] = useState<any | null>();
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
      //padding: "20px",  // Remove any padding
      margin: 0,   // Remove any margins
      marginLeft: 0,
      height: "100%",
      width: "100%",

    },
    customStyle: {
      color: "#272B30;", // Custom style example
      fontSize: "14px",
      // fontFamily:"sans-serif"
    },
    assigneeStyle: {
      color: "#272B30",
      fontSize: "16px",
      letterSpacing: "0.15px",
    },
    Helper_Text: {
      // font-family: 'Lato', sans-serif !important;
      color: "#7E8083",
      fontSize: "12px",
      fontWeight: "bold",
      lineHeight: "21px",
      letterSpacing: "0.15px",
    },
    Input_Text: {
      color: "#272B30",
      // font-family: 'Lato', sans-serif !important;
      fontSize: "13px",
      fontWeight: "bold",
      lineHeight: "21px",
      letterSpacing: "0.15px",
    },
    Input_HeaderText: {
      color: "#272B30",
      // font-family: 'Lato', sans-serif !important;
      fontSize: "18px",
      fontWeight: "bold",
      lineHeight: "21px",
      letterSpacing: "0.15px",
    },
  });

  const tableData = [
    { Sr: " ", "StoreCode": " ", Description: " ", "Quantity": " " },
    { Sr: " ", "StoreCode": " ", Description: " ", "Quantity": " " },
    { Sr: " ", "StoreCode": " ", Description: " ", "Quantity": "" },
    // { Sr:" ", "StoreCode": " ", Description: "", "Quantity":"" },
    // { Sr:" ", "StoreCode": " ", Description: "", "Quantity":"" },
    // { Sr:" ", "StoreCode": " ", Description: "", "Quantity":"" },
    // { Sr:" ", "StoreCode": " ", Description: "", "Quantity":"" },
    // { Sr:" ", "StoreCode": " ", Description: "", "Quantity":"" },
  ];


  useEffect(() => {
    const workOrderData: any = localStorage.getItem('workDetailsReport');
    const workReportData: any = JSON.parse(workOrderData);
    const technicianData: any = localStorage.getItem('TECHNICIAN_LIST');
    const assignee = JSON.parse(technicianData)
    const workReports = {
      "Priority": workReportData[0]?.SEVERITY || "",
      "Location Name": workReportData[0]?.LOCATION_DESCRIPTION || "",
      "Equipment": workReportData[0]?.ASSET_DESCRIPTION || "",
      "Type": workReportData[0]?.ASSET_NONASSET === "A" ? "Equipment" : "Soft Service",
      "Type Of Work": workReportData[0]?.WO_TYPE_NAME || "",
      "Attention To": workReportData[0]?.TEAM_NAME || "",
      "Description": workReportData[0]?.ISSUE_DESCRIPTION || "",
      "Reporter": workReportData[0]?.RAISED_BY_NAME || "",
      "Reported Date": workReportData[0]?.REPORTED_AT || "",
      "Created Date": workReportData[0]?.WO_REPORTED_AT || "",
    };

    const assigneesDetails = assignee?.map((assign: any) => {
      return {
        name: assign.LOGIN_NAME,
        teamName: workReportData[0]?.TEAM_NAME
      };
    })

    setAssigneeData(assigneesDetails);
    setReportWorkOrder([workReports]);
    setWorkOrderNo(workReportData[0]?.WO_NO)
    setWorkOrderDescription(workReportData[0]?.DESCRIPTION)
  }, []);

  return (
    <>
      <Document>
        <Page style={styles.page}>
          <View fixed>
            <HeaderView />
          </View>

          <View style={tw("flex flex-row justify-between mb-6 ")}>
            <View
              style={tw(
                "w-3/5 flex flex-row justify-between bg-black rounded-md text-white mr-2"
              )}
            >
              <View style={tw("w-2/5 p-4")}>
                <Text style={tw("text-xl mb-0")}>Work Order</Text>
              </View>
              <View style={tw("w-3/5 p-4")}>
                <Text style={tw("font-bold text-lg text-right mb-0")}>
                  {workOrderNo}
                </Text>
              </View>
            </View>

            <View
              style={tw(
                "w-2/5 rounded-md border border-black flex items-center justify-center"
              )}
            >
              <Text style={[tw(""), styles.Input_Text]}>
                Printed Date:- {new Date().toLocaleDateString()}
              </Text>
            </View>
          </View>

          <View style={tw("flex flex-row justify-between ")}>
            <View
              style={[
                tw("w-3/5 rounded-md border border-black mr-2 p-4 flex-grow"),
              ]}
            >
              <Text style={[tw("mb-3"), styles.Input_HeaderText]}>
                Work Order Details
              </Text>

              {reportWorkOrder && reportWorkOrder?.map((workOrder: any, index: any) => (
                <View key={index}>
                  {Object.entries(workOrder).map(([key, value], i) => (
                    <View style={tw(`flex flex-row mb-2`)} key={i}>
                      <View style={tw(`w-2/4`)}>
                        <Text
                          style={[tw(""), styles.Helper_Text]}
                        >{`${key.replace(/_/g, " ")}`}</Text>
                      </View>

                      <View style={tw(`w-2/4 `)}>
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
              style={tw("w-2/5 rounded-md border border-black p-4 flex-grow")}
            >
              <Text style={[tw("mb-3"), styles.Input_HeaderText]}>
                Assignee({assigneeData?.length})
              </Text>

              {assigneeData.map((assignee: any, index: any) => (
                <View key={index} style={tw(`flex flex-col mb-2`)}>
                  <Text style={styles.Input_Text}>{assignee.name}</Text>
                  <Text style={styles.Helper_Text}>({assignee.teamName})</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={tw("h-2")}></View>
          <View style={tw("w-full rounded-md border p-4 border-black")}>
            <View>
              <Text style={[tw("mb-3"), styles.Input_HeaderText]}>
                Work Analysis & Material
              </Text>
            </View>
            <View style={tw(`flex flex-row mb-2`)}>
              {/* Left Column */}
              <View style={tw(`w-1/4`)}>
                <Text style={styles.Helper_Text}> Cause of problem</Text>
              </View>

              {/* Right Column */}
              <View style={tw(`w-3/4 `)}>
                <Text style={styles.Input_Text}>
                  {workOrderDescription}
                </Text>
              </View>
            </View>
            <View style={tw(`flex flex-row mb-2`)}>
              {/* Left Column */}
              <View style={tw(`w-1/4`)}>
                <Text style={styles.Helper_Text}> Spares Used</Text>
              </View>

              {/* Right Column */}
              <View style={tw(`w-3/4 border-b border-gray-800`)}>
                <Text style={styles.Input_Text}>
                  {/* ------------------------------------------------------------------------------------ */}
                </Text>
              </View>
            </View>
            <View style={tw(`flex flex-row mb-2`)}>
              {/* Left Column */}
              <View style={tw(`w-1/4`)}>
                <Text style={styles.Helper_Text}> Resolution Description</Text>
              </View>

              {/* Right Column */}
              <View style={tw(`w-3/4 border-b border-gray-800`)}>
                <Text style={styles.Input_Text}>
                  {/* ------------------------------------------------------------------------------------ */}
                </Text>
              </View>
            </View>
            <View style={tw(`flex flex-row mb-2`)}>
              {/* Left Column */}
              <View style={tw(`w-1/4`)}>
                <Text style={styles.Helper_Text}> Part Replaced</Text>
              </View>

              {/* Right Column */}
              <View style={tw('w-3/4')}>
                <View style={tw('')}>
                  {/* Table Header */}
                  <View style={tw('flex flex-row')}>
                    <Text style={[tw('w-1/4 p-2 border border-gray-400 text-left'), styles.Input_Text]}>Sr No</Text>
                    <Text style={[tw('w-1/4 p-2 border border-gray-400 text-left'), styles.Input_Text]}>Store Code</Text>
                    <Text style={[tw('w-1/4 p-2 border border-gray-400 text-left'), styles.Input_Text]}>Description</Text>
                    <Text style={[tw('w-1/4 p-2 border border-gray-400 text-left'), styles.Input_Text]}>Quantity</Text>
                  </View>

                  {/* Table Rows */}
                  {tableData.map((row, index) => (
                    <View key={index} style={tw('flex flex-row')}>
                      <Text style={[tw('w-1/4 p-1 border border-gray-400 text-left'), { minHeight: 10, flexWrap: 'wrap' }, styles.Input_Text]}>{row.Sr}</Text>
                      <Text style={[tw('w-1/4 p-1 border border-gray-400 text-left'), styles.Input_Text]}>{row.StoreCode}</Text>
                      <Text style={[tw('w-1/4 p-1 border border-gray-400 text-left'), styles.Input_Text]}>{row.Description}</Text>
                      <Text style={[tw('w-1/4 p-1 border border-gray-400 text-left'), styles.Input_Text]}>{row.Quantity}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>
          <View style={tw("h-10")}></View>
          <View style={tw("flex flex-row gap-3 mt-3")}>
            <Text
              style={[
                tw(`w-1/3 p-4 border border-black h-20 rounded-md text-left`),
                styles.Input_Text,
              ]}
            >
              Technician Assign By
            </Text>
            <Text
              style={[
                tw(`w-1/3 p-4 border border-black h-20 rounded-md text-left`),
                styles.Input_Text,
              ]}
            >
              Technician Assign By
            </Text>
            <Text
              style={[
                tw(`w-1/3 p-4 border border-black h-20 rounded-md text-left`),
                styles.Input_Text,
              ]}
            >
              Date/Time
            </Text>

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
          <View style={tw(` rounded-md border border-black p-4 mt-3 mb-6`)}>
            <Text style={styles.Input_Text}>
              This document is RESTRICTED and shall not be lent to or copied by
              any person without authorization from the Management of Keppel
              Seghers Engineering Singapore Pte Ltd. A retained printed paper
              version may not be the latest version staff can verify on the
              latest version from KLIK+FM
            </Text>
          </View>

          <View fixed
            style={{
              position: "absolute",
              bottom: 10, // Position 10 units from bottom
              left: 0,
              right: 0,
              top: "auto",
              textAlign: "center",
              borderTop: "1 solid black",
              paddingTop: 5,
            }}>
            <Text style={styles.customStyle}> Keppel CMMS</Text>
          </View>
        </Page>
      </Document>
    </>
  );
};

export default WorkOrderReport;
