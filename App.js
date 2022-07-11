import { LinearGradient } from "expo-linear-gradient";
import { Audio } from "expo-av";
import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  // TouchableOpacity,
  StatusBar,
  Alert,
} from "react-native";

import Sounds from "./sound"


var pressed = false,
  thinkEnd = true;

var answerStart = false,
  answerEnd = false,
  answerYes = false,
  answerNo = false,
  answerBack = false;

var Qnum = 0,
  left = 1,
  mid = 500,
  right = 1000;

var backUp = [];
var askIsThat = false;
var figureOut = false;

export default class extends React.Component {
  state = {
    GameState: "Start",
  };

  gameReset() {
    this.sounds.stop("FigureOut");
    this.sounds.play("BGM");
    backUp = [];
    figureOut = false;
    (Qnum = 0), (left = 1), (mid = 500), (right = 1000); //// 1001 X
    this.setState({
      GameState: "Start",
    });
  }

  constructor() {
    super();
    this.sounds = new Sounds()
  }

  ask() {
    //// mid == right - 1 || && mid == left + 1
    if (right - left <= 2) {
      askIsThat = true;
    } else {
      askIsThat = false;
    }
    this.setState({
      GameState: "Ask",
    });
  }

  think(YorN) {
    Qnum++;
    backUp.push({
      left: left,
      mid: mid,
      right: right,
    });

    switch (askIsThat) {
      case true:
        switch (YorN) {
          case true:
            figureOut = true;
            break;
          case false:
            right = mid;
            mid = right - 1;
        }
        break; //// break를 쓰면 오류가 안 난다
      case false:
        switch (YorN) {
          case true:
            right = mid;
            mid = right - parseInt((right - left + 1) / 2);
            if (left == mid) {
              figureOut = true
            }
            break;
          case false:
            left = mid;
            mid = left + parseInt((right - left + 1) / 2);
        }
    }
    //// 질문 10번이 끝나면 무조건 답을 찾아내게 되있는데, 이것이냐고 콕 집어 물어보는 질문에 아니라고 답하면 답을 구한 줄 모름
    //// 남은 숫자가 하나인데도 답을 못 찾는 경우가 있음
    right - left + 1 == 1 || Qnum == 10 ? (figureOut = true) : {}; ////
    answerYes = false;
    answerNo = false;
  }

  back() {
    if (figureOut) {
      this.sounds.stop("FigureOut");
      this.sounds.play("BGM");
      figureOut = false;
    }
    if (Qnum == 0) {
      this.setState({
        GameState: "Start",
      });
    } else if (backUp.length == Qnum) {
      Qnum--;
      left = backUp[Qnum].left;
      mid = backUp[Qnum].mid;
      right = backUp[Qnum].right;
      // backUp = backUp.slice(0, Qnum)
      backUp.pop(); /// backUp = backUp.pop() X
      this.ask();
    } else {
      Alert.alert("에러1...", "처음으로 돌아간다");
      this.setState({
        GameState: "Think",
      });
    }
  }

  Questions_10() {
    pressed = false;

    // 생각 중 화면 띄우기
    thinkEnd = false;
    this.setState({
      GameState: "Think",
    });

    // 시작 또는 끝내기, 뒤로가기 버튼 눌렀을 때
    if (answerStart) {
      answerStart = false;
      this.sounds.play("Answer");
      this.ask();
    } else if (answerEnd) {
      answerEnd = false;
      this.sounds.play("End");
      this.gameReset();
    } else if (answerBack) {
      answerBack = false;
      this.sounds.play("Back");
      this.back();
    } else if (Qnum < 10 && (answerYes || answerNo)) {
      // 열 고개 대답을 받았을 때
      this.sounds.play("Answer");
      if (answerYes) {
        this.think(true);
      } else if (answerNo) {
        this.think(false);
      }

      // 답을 아직 모를 때, 알아냈을 때, 10고개 다 써도 답을 알아내지 못했을 때
      if (figureOut == false && Qnum < 10) {
        this.ask();
      } else if (figureOut) {
        this.sounds.stop("BGM");
        this.sounds.play("FigureOut");
        this.setState({
          askIsThat: false,
          GameState: "End",
        });
        // } else {
        //   this.sounds.play("Failed");
        //   this.setState({
        //     askIsThat: false,
        //     GameState: "Failed",
        //   });
      }
    } else {
      Alert.alert("에러2...", "처음으로 돌아간다");
    }
    thinkEnd = true;
  }

  componentDidMount() {
    setInterval(() => (pressed && thinkEnd ? this.Questions_10() : {}), 100);
  } // 0.1초(100ms) 마다 반복

  render() {
    const { GameState } = this.state;
    switch (GameState) {
      case "Start":
        return <StartPage />;
      case "Ask":
        return <QuestionPage />;
      case "Think":
        return <ThinkingPage />;
      case "End":
        return <AnswerPage />;
      // case "Failed":
      //   return <FailedPage Qnum={Qnum} />;
      default:
        Alert.alert("에러3...", "처음으로 돌아가라");
        return <ThinkingPage />;
    }
  }
}

function StartPage() {
  function PressStart() {
    pressed = true;
    answerStart = true;
  }
  return (
    <LinearGradient colors={["#141E30", "#243B55"]} style={view.container}>
      <StatusBar barStyle="light-content" />
      <View style={view.statusbarSide} />

      <View style={view.upSide}>
        <View style={view.start}>
          <Text style={question.title}>숫자 맞추기 10고개!</Text>
        </View>

        <View style={view.start2}>
          <Text style={question.text}>1 ~ 1000 안에서</Text>
          <Text style={question.text}>하나를 생각해봐!</Text>
        </View>
      </View>

      <View style={view.downSide}>
        <TouchableHighlight
          style={answer.greenView}
          type={View}
          onPress={PressStart}
        >
          <Text style={answer.text}>생각했다!</Text>
        </TouchableHighlight>
      </View>

      <StatusBar style="auto" />
    </LinearGradient>
  );
}

function QuestionPage() {
  function PressYes() {
    pressed = true;
    answerYes = true;
  }
  function PressNo() {
    pressed = true;
    answerNo = true;
  }
  function PressBack() {
    pressed = true;
    answerBack = true;
  }
  function PressHelp() {
    Alert.alert("도움말", "자신이 자신보다 작냐고 물어보면\n작은게 아니다!");
  }
  function askText({ mid, askIsThat }) {
    switch (askIsThat) {
      case true:
        return `${mid}(이)니?`;
      case false:
        return `${mid}보다 작니?`;
    }
  }
  function getGradientColor({ Qnum }) {
    if (Qnum > 5) {
      return ["#2c3e50", "#2980b9"]; // "#2c3e50", "#3498db"
    } else if (Qnum > 2) {
      return ["#0F2027", "#203A43", "#2C5364"];
    } else {
      return ["#141E30", "#243B55"]; // "#0052D4", "#65C7F7", "#9CECFB"
    }
  }
  var text = askText({ mid, askIsThat });
  var gradientColor = getGradientColor({ Qnum });
  return (
    <LinearGradient colors={gradientColor} style={view.container}>
      <StatusBar barStyle="light-content" />
      <View style={view.statusbarSide} />

      <View style={view.upSide}>
        <View style={view.menu}>
          <TouchableHighlight style={view.help} type={View} onPress={PressHelp}>
            <Text style={answer.backText}>?</Text>
          </TouchableHighlight>

          <Text style={question.Qnum}>남은 고개: {10 - Qnum}</Text>
        </View>

        <View style={view.QuestionView}>
          <Text style={question.text}>생각한 숫자는</Text>
          <Text style={question.text}>{text}</Text>
          {/* <Text style={question.text}>
            {left} {mid} {right}
          </Text> */}
        </View>

        <TouchableHighlight
          style={view.grayView}
          type={View}
          onPress={PressBack}
        >
          <Text style={answer.backText}>뒤로 가기</Text>
        </TouchableHighlight>
      </View>

      <View style={view.downSide}>
        <TouchableHighlight
          style={answer.greenViewHalf}
          type={View}
          onPress={PressYes}
        >
          <Text style={answer.text}>응!</Text>
        </TouchableHighlight>

        <TouchableHighlight
          style={answer.purpleViewHalf}
          type={View}
          onPress={PressNo}
        >
          <Text style={answer.text}>아니!</Text>
        </TouchableHighlight>
      </View>

      <StatusBar style="auto" />
    </LinearGradient>
  );
}

function ThinkingPage() {
  function askText({ mid, askIsThat }) {
    switch (askIsThat) {
      case true:
        return `${mid}(이)니?`;
      case false:
        return `${mid}보다 작니?`;
    }
  }
  function PressYes() {
    pressed = true;
    answerEnd = true;
  }
  var text = askText({ mid, askIsThat });
  return (
    <LinearGradient
      colors={["#0F2027", "#203A43", "#2C5364"]}
      style={view.container}
    >
      <StatusBar barStyle="light-content" />
      <View style={view.statusbarSide} />

      <View style={view.upSide}>
        <View style={view.menu}>
          <Text style={question.Qnum}>남은 고개: {10 - Qnum}</Text>
        </View>

        <View style={view.QuestionView}>
          <Text style={question.text}>생각한 숫자는</Text>
          <Text style={question.text}>{text}</Text>
          <Text style={question.text}>생각 중...어쩌면 오류</Text>
        </View>
      </View>

      <View style={view.downSide}>
        <TouchableHighlight
          style={answer.grayView2}
          type={View}
          onPress={PressYes}
        >
          <Text style={answer.text}>처음으로...</Text>
        </TouchableHighlight>
      </View>

      <StatusBar style="auto" />
    </LinearGradient>
  );
}

function AnswerPage() {
  function PressYes() {
    pressed = true;
    answerEnd = true;
  }
  function PressBack() {
    pressed = true;
    answerBack = true;
  }
  function PressHelp() {
    Alert.alert("도움말", "자신이 자신보다 작냐고 물어보면\n작은게 아니다!");
  }
  return (
    <LinearGradient colors={["#e1eec3", "#f05053"]} style={view.container}>
      <StatusBar barStyle="dark-content" />
      <View style={view.statusbarSide} />

      <View style={view.upSide}>
        <View style={view.menu}>
          <TouchableHighlight style={view.help} type={View} onPress={PressHelp}>
            <Text style={answer.backText2}>?</Text>
          </TouchableHighlight>

          <Text style={question.answerQnum}>남은 고개: {10 - Qnum}</Text>
        </View>

        <View style={view.QuestionView}>
          <Text style={question.answerNum}>너가 생각한 숫자는</Text>
          <Text style={question.answerNum2}>{mid}</Text>
          <Text style={question.answerNum}>ㄴ(^o^)ㄱ</Text>
        </View>

        <TouchableHighlight
          style={view.grayView}
          type={View}
          onPress={PressBack}
        >
          <Text style={answer.backText}>뒤로 가기</Text>
        </TouchableHighlight>
      </View>

      <View style={view.downSide}>
        <TouchableHighlight
          style={answer.greenView}
          type={View}
          onPress={PressYes}
        >
          <Text style={answer.text}>넘나 멋져!</Text>
        </TouchableHighlight>
      </View>

      <StatusBar style="auto" />
    </LinearGradient>
  );
}

// function FailedPage({ Qnum }) {
//   function PressBack() {
//     pressed = true;
//     answerBack = true;
//   }
//   return (
//     <LinearGradient
//       // Button Linear Gradient
//       colors={["#0F2027", "#203A43", "#2C5364"]}
//       style={view.container}
//     >
//       <StatusBar barStyle="light-content" />
//       <View style={view.statusbarSide} />
//       <View style={view.upSide}>
//         <View style={view.menu}>
//           <Text style={question.Qnum}>남은 고개: {10 - Qnum}</Text>
//         </View>

//         <View style={view.QuestionView}>
//           <Text style={question.text}>답을 정확히 해줘!</Text>
//           <Text style={question.text}>(1 ~ 1000 밖이니...?)</Text>
//         </View>
//       </View>

//       <View style={view.downSide}>
//         <TouchableHighlight
//           style={answer.grayView2}
//           type={View}
//           onPress={PressBack}
//         >
//           <Text style={answer.text}>뒤로 가기</Text>
//         </TouchableHighlight>
//       </View>

//       <StatusBar style="auto" />
//     </LinearGradient>
//   );
// }

const view = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusbarSide: {
    flex: 0.3,
  },
  upSide: {
    flex: 6,
    // alignItems: "center",
    // justifyContent: "center",
    // minHeight: "75%",
  },
  downSide: {
    flex: 2,
    flexDirection: "row",
    justifyContent: "center",
    // minHeight: '25%',
  },
  menu: {
    flex: 1,
    // flexDirection: "row",
    // backgroundColor: "purple",
    // paddingVertical: "7%",
  },
  help: {
    fontWeight: "bold",
    borderRadius: 100,
    fontSize: 30,
    width: 30,
    alignItems: "center", // 글자 정렬
    alignSelf: "flex-end", // flexDirection에 수직인 방향으로 자신을 정렬
    // backgroundColor: "gray",
    marginHorizontal: 8,
  },
  QuestionView: {
    flex: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  start: {
    flex: 1,
    // width: "100%", // 버튼이 아니면 꽉 안 채워짐
    backgroundColor: "purple",
    borderRadius: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  start2: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  grayView: {
    flex: 1,
    width: "35%",
    // paddingVertical: 10,
    // borderRadius: "50%",
    borderTopLeftRadius: 30, // borderTopStartRadius: "50%",
    borderTopRightRadius: 30, // borderTopEndRadius: "50%",
    backgroundColor: "gray",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
});

const question = StyleSheet.create({
  title: {
    color: "white",
    fontWeight: "900",
    fontSize: 45,
  },
  text: {
    color: "yellow",
    fontWeight: "bold",
    fontSize: 40,
  },
  answerNum: {
    color: "black",
    fontWeight: "bold",
    fontSize: 40,
  },
  answerNum2: {
    color: "black",
    fontWeight: "bold",
    fontSize: 100,
  },
  answer: {
    color: "white",
    fontWeight: "bold",
    fontSize: 50,
  },
  Qnum: {
    color: "yellow",
    fontWeight: "bold",
    fontSize: 30,
    alignSelf: "center",
  },
  answerQnum: {
    color: "black",
    fontWeight: "bold",
    fontSize: 30,
    alignSelf: "center",
  },
});

const answer = StyleSheet.create({
  greenView: {
    flex: 1,
    // width: "100%",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "green",
    // height: '100%'
  },
  greenViewHalf: {
    flex: 1,
    // width: "100%",
    borderTopLeftRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "green",
    // height: '100%'
  },
  purpleViewHalf: {
    flex: 1,
    width: "100%",
    borderTopRightRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "purple",
    // height: '100%'
  },
  grayView2: {
    flex: 1,
    width: "100%",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "gray",
    // height: '100%'
  },
  text: {
    color: "white",
    fontWeight: "bold",
    fontSize: 60,
  },
  backText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 30,
  },
  backText2: {
    color: "black",
    fontWeight: "bold",
    fontSize: 30,
  },
});
