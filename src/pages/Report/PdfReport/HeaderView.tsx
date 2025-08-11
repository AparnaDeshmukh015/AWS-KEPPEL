import React from 'react'
import { Text, View, StyleSheet } from '@react-pdf/renderer'
import { createTw } from 'react-pdf-tailwind';

const tw = createTw({
  theme: {
    extend: {
      colors: {
        black: '#000',
      },
    },
  },
});


const HeaderView = () => {
  return (
    <View style={tw("flex flex-row justify-between mb-6 mt-4")}>
      {/* First Column (60% width) */}
      <View style={tw("w-3/5")}>
        <Text style={tw("text-xl font-bold")}>Klik+FM</Text>
      </View>

      {/* Second Column (40% width) */}
      <View
        style={[
          tw(
            "w-2/5 rounded-md border border-black flex items-center justify-center"
          ),
        ]}
      >
        <Text
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages}`
          }
          fixed
        />
      </View>
    </View>
  );
};

export default HeaderView;
