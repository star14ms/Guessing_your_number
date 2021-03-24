import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={view.container}>

      <View style={view.blackView}>
        <Text style={question.text}>넌 천재니?</Text>
      </View>

      <View style={view.answerView}>
        <View style={answer.greenView}>
          <Text style={answer.text}>네!</Text>
        </View>
        <View style={answer.orangeView}>
          <Text style={answer.text}>아니요!</Text>
        </View>
      </View>

      <StatusBar style="auto"/>
    </View>
  );
}

const view = StyleSheet.create({
  container: {
    flex: 1,
  },
  blackView: {
    flex: 3,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
    // minHeight: "75%",
  },
  answerView: {
    flex: 1,
    flexDirection: 'row',
    // minHeight: '25%',
  },
});

const question = StyleSheet.create({
  text: {
    color: 'yellow',
    fontWeight: 'bold',
    fontSize: 60,
  },
});

const answer = StyleSheet.create({
  greenView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'green',
    // height: '100%'
  },
  orangeView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'purple',
    // height: '100%'
  },
  text: {
    color: 'white',
    fontWeight: '700',
    fontSize: 40,
  },
});

