import React from 'react'
import { Text, View, Image, StyleSheet } from '@react-pdf/renderer'
import logo from '../images/testLogo.png'
import { createTw } from 'react-pdf-tailwind';
import logoImage from "../../../../assest/images/klik_FM_Logo_Black.png"

const tw = createTw({
  theme: {
    extend: {
      colors: {
        black: '#000',
      },
    },
  },
});
const styles = StyleSheet.create({
  heading5: {
    fontSize: 90 * 0.75, // Convert 96px to points (96px * 0.75 = 72pt)
    fontWeight: "bold", // Use 'normal' or a valid weight like 400
    marginBottom: 5,
  },
  Input_Text: {
    color: "#272B30",
    // font-family: 'Lato', sans-serif !important;
    fontSize: "12px",
    fontWeight: "bold",
    lineHeight: "21px",
    letterSpacing: "0.15px",
  },
  Image_Logo: {
    display: "flex",
    width: "103.989px",
    height: "22.415px",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  boxContainer: {
  display: "flex",
  padding: "7.904px 0px 7.904px 2.47px",
  gap: "3.952px",
  alignSelf: "stretch",
  borderRadius: "2.964px",
  border: "1px solid #343434",
 

  },
  boxTextHeading :{
    fontSize: "9px",
    fontWeight:"bold",
    lineHeight: "12px",
    letterSpacing: " 0.074px",
    color: "#272B30"
  }
});

const HeaderView = () => {
  return (
    <View style={tw("flex flex-row gap-3 mb-2.5 justify-between")}>
      {/* First Column (60% width) */}
      <View style={tw("w-4/6")}>
        {/* <Text style={tw("text-6xl font-bold")}>Klik+FM</Text> */}
        <Image src={logoImage} style={styles.Image_Logo}></Image>
      </View>

      {/* Second Column (40% width) */}
      <View
        style={[
          tw(
            "w-2/6 rounded-md  flex items-center justify-center"
          ),styles.boxContainer
        ]} 
      >
        <Text 
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages}`
          }
          // fixed
        ></Text>
      </View>
    </View>
  );
};

export default HeaderView;
