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

const soundBGM = new Audio.Sound();
const soundFigureOut = new Audio.Sound();
const soundEnd = new Audio.Sound();
const soundAnswer = new Audio.Sound();
const soundBack = new Audio.Sound();
const soundFailed = new Audio.Sound();

var pressed = false,
  thinkEnd = true;
var answerStart = false,
  answerEnd = false;
var answerYes = false,
  answerNo = false;
var figureOut = false;

var answerBack = false;
var backUp = [];

export default class extends React.Component {
  state = {
    GameState: "Start",
    askIsThat: false,
    Qnum: 0,
    left: 1,
    mid: 500,
    right: 1000,
  };

  loadSound_PlayBGM = async () => {
    await soundBGM.loadAsync(require("./assets/Sunfl - Doll.mp3"));
    await soundFigureOut.loadAsync(require("./assets/[효과음]축복.mp3"));
    await soundEnd.loadAsync(require("./assets/무한도전 효과음(1).mp3"));
    await soundAnswer.loadAsync(require("./assets/클릭음27.mp3"));
    await soundBack.loadAsync(require("./assets/클릭음13.mp3"));
    await soundFailed.loadAsync(require("./assets/[효과음]Bounce.mp3"));
    await soundBGM.playAsync();
  };
  playSound = async (sound) => {
    await sound.playAsync();
  };
  replaySound = async (sound) => {
    sound.replayAsync();
  };

  stopSound = async (sound) => {
    await sound.stopAsync();
  };

  gameReset() {
    backUp = [];
    this.stopSound(soundFigureOut);
    this.replaySound(soundBGM);
    figureOut = false;
    this.setState({
      GameState: "Start",
      Qnum: 0,
      left: 1,
      mid: 500,
      right: 1001,
    });
  }

  constructor() {
    super();
    this.loadSound_PlayBGM();
  }

  ask() {
    //// this.state.mid == this.state.right - 1 || && this.state.mid == this.state.left + 1
    if (this.state.right - this.state.left <= 2) {
      this.state.askIsThat = true;
    } else {
      this.state.askIsThat = false;
    }
    this.setState({
      GameState: "Ask",
    });
  }

  think(YorN) {
    this.state.Qnum++;
    backUp.push({
      left: this.state.left,
      mid: this.state.mid,
      right: this.state.right,
    });
    if (YorN) {
      if (this.state.askIsThat) {
        figureOut = true;
      } else {
        this.state.right = this.state.mid;
        this.state.mid =
          this.state.right -
          parseInt((this.state.right - this.state.left + 1) / 2);
      }
    } else {
      if (this.state.askIsThat) {
        this.state.right = this.state.mid;
        this.state.mid =
          this.state.right -
          parseInt((this.state.right - this.state.left + 1) / 2);
      } else {
        this.state.left = this.state.mid;
        this.state.mid =
          this.state.left +
          parseInt((this.state.right - this.state.left + 1) / 2);
      }
    }
    //// 질문 10번이 끝나면 무조건 답을 찾아내게 되있는데, 이것이냐고 콕 집어 물어보는 질문에 아니라고 답하면 답을 구한 줄 모름
    //// 남은 숫자가 하나인데도 답을 못 찾는 경우가 있음
    this.state.right - this.state.left == 1 || this.state.Qnum == 10
      ? (figureOut = true)
      : {}; ////
    answerYes = false;
    answerNo = false;
    thinkEnd = true;
  }

  back() {
    if (figureOut) {
      this.stopSound(soundFigureOut);
      this.replaySound(soundBGM);
      figureOut = false;
    }
    if (this.state.Qnum == 0) {
      this.setState({
        GameState: "Start",
      });
    } else if (backUp.length == this.state.Qnum) {
      // backUp = backUp.slice(0, this.state.Qnum)
      this.state.Qnum--;
      this.state.left = backUp[this.state.Qnum].left;
      this.state.mid = backUp[this.state.Qnum].mid;
      this.state.right = backUp[this.state.Qnum].right;
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

    // 시작 또는 끝내기, 뒤로가기 버튼 눌렀을 때
    if (answerStart) {
      this.replaySound(soundAnswer);
      this.ask();
      answerStart = false;
      return;
    } else if (answerEnd) {
      this.replaySound(soundEnd);
      this.gameReset();
      answerEnd = false;
      return;
    } else if (answerBack) {
      this.replaySound(soundBack);
      this.back();
      answerBack = false;
      return;
    }

    // 생각 중 화면 띄우기
    thinkEnd = false;
    this.setState({
      GameState: "Think",
    });

    // 열 고개 대답을 받았을 때
    if (this.state.Qnum < 10 && (answerYes || answerNo)) {
      this.replaySound(soundAnswer);
      if (answerYes) {
        this.think(true);
      } else if (answerNo) {
        this.think(false);
      }

      // 답을 아직 모를 때, 알아냈을 때, 10고개 다 써도 답을 알아내지 못했을 때
      if (figureOut == false && this.state.Qnum < 10) {
        this.ask();
      } else if (figureOut) {
        this.stopSound(soundBGM);
        this.replaySound(soundFigureOut);
        this.setState({
          askIsThat: false,
          GameState: "End",
        });
      } else {
        this.replaySound(soundFailed);
        this.setState({
          askIsThat: false,
          GameState: "Failed",
        });
      }
    } else {
      Alert.alert("에러2...", "처음으로 돌아간다");
      this.setState({
        GameState: "Think",
      });
    }
  }

  componentDidMount() {
    setInterval(() => (pressed && thinkEnd ? this.Questions_10() : {}), 100); // 0.1초(100ms) 마다 반복
  }

  render() {
    const { left, right, GameState, askIsThat, Qnum, mid } = this.state;
    switch (GameState) {
      case "Start":
        return <StartPage />;
      case "Ask":
        return (
          <QuestionPage
            left={left}
            right={right}
            mid={mid}
            askIsThat={askIsThat}
            Qnum={Qnum}
          />
        );
      case "Think":
        return <ThinkingPage mid={mid} askIsThat={askIsThat} Qnum={Qnum} />;
      case "End":
        return <AnswerPage mid={mid} Qnum={Qnum} />;
      case "Failed":
        return <FailedPage Qnum={Qnum} />;
      default:
        Alert.alert("에러3...", "처음으로 돌아간다");
        return <ThinkingPage />;
    }
  }
}

function StartPage() {
  function PressYes() {
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
        {/* <View style={view.start}>
          <Text style={question.text}>내가 맞춰볼게!</Text>
        </View> */}
      </View>

      <View style={view.downSide}>
        <TouchableHighlight
          style={answer.greenView}
          type={View}
          onPress={PressYes}
        >
          <Text style={answer.text}>생각했다!</Text>
        </TouchableHighlight>
      </View>

      <StatusBar style="auto" />
    </LinearGradient>
  );
}

function QuestionPage({ left, right, mid, askIsThat, Qnum }) {
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

function ThinkingPage({ mid, askIsThat, Qnum }) {
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

function AnswerPage({ mid, Qnum }) {
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
    <LinearGradient
      // Button Linear Gradient
      colors={["#e1eec3", "#f05053"]}
      style={view.container}
    >
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

      {/* <StatusBar style="auto" /> */}
    </LinearGradient>
  );
}

function FailedPage({ Qnum }) {
  function PressBack() {
    pressed = true;
    answerBack = true;
  }
  return (
    <LinearGradient
      // Button Linear Gradient
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
          <Text style={question.text}>답을 정확히 해줘!</Text>
          <Text style={question.text}>(1 ~ 1000 밖이니...?)</Text>
        </View>
      </View>

      <View style={view.downSide}>
        <TouchableHighlight
          style={answer.grayView2}
          type={View}
          onPress={PressBack}
        >
          <Text style={answer.text}>뒤로 가기</Text>
        </TouchableHighlight>
      </View>

      <StatusBar style="auto" />
    </LinearGradient>
  );
}

const view = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusbarSide: {
    flex: 0.2,
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
    marginHorizontal: 17,
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
    fontWeight: "bold",
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
  imoticon: {
    color: "red",
    fontWeight: "bold",
    fontSize: 50,
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
