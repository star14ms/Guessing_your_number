import { Audio } from "expo-av";


export default class Sounds {
    sounds: {[key: string]: Audio.Sound};
  
    constructor() {
      this.sounds = {}
      this.load_sounds()
    }

    register(soundName: string) {
      this.sounds[soundName] = new Audio.Sound()
    }

    load_sounds = async () => {
      this.register("BGM")
      this.register("FigureOut")
      this.register("End")
      this.register("Answer")
      this.register("Back")
      this.register("Failed")

      await this.sounds["BGM"].loadAsync(require("./assets/sounds/Sunfl-Doll.mp3"));
      await this.sounds["FigureOut"].loadAsync(require("./assets/sounds/[효과음]축복.mp3"));
      await this.sounds["End"].loadAsync(require("./assets/sounds/무한도전_효과음(1).mp3"));
      await this.sounds["Answer"].loadAsync(require("./assets/sounds/클릭음27.mp3"));
      await this.sounds["Back"].loadAsync(require("./assets/sounds/클릭음13.mp3"));
      await this.sounds["Failed"].loadAsync(require("./assets/sounds/[효과음]Bounce.mp3"));

      await this.sounds["BGM"].setIsLoopingAsync(true);
      await this.sounds["FigureOut"].setIsLoopingAsync(true);
      await this.sounds["BGM"].replayAsync();
    }

    play = async (sound: string) => {
      await this.sounds[sound].replayAsync();
    };

    stop = async (sound: string) => {
      await this.sounds[sound].stopAsync();
    };
}
