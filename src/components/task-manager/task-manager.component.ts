import { Component, Pipe } from 'angular-ts-decorators';

const gImageAPI = 'https://vision.googleapis.com/v1/images:annotate?key=AIzaSyCyB10JB7ifXsUTTJ1n5c7CpBnC8F3G_yc';
import './tasks.scss';
const template = require('./task-manager.html');
const YES_SCORE = ['VERY_LIKELY', 'LIKELY', 'POSSIBLE'];
const NO_SCORE = ['VERY_UNLIKELY', 'UNLIKELY'];

enum Emotion { Happy, Sad, Surprised, Angry, WearHat, Neutral }

const music = {
  [Emotion.Happy]: 'uplifting',
  [Emotion.Sad]: 'melancholic',
  [Emotion.WearHat]: 'hiphop',
  [Emotion.Neutral]: 'neutral',
};

const scAutoplay = '&auto_play=true';

@Component({
  selector: 'taskManager',
  template
})
export class TaskManager implements ng.IComponentController {
  emotions: Emotion[];
  widget: any;
  musicLink = 'http://api.soundcloud.com/users/30754/favorites';
  widgetIframe: any;
  shot: string;
  decision: string;
  tts: any;
  loading: boolean = true;
  /*@ngInject*/
  constructor(private $http: ng.IHttpService,
              private $document: ng.IAugmentedJQuery,
              private $timeout: ng.ITimeoutService) {
    this.tts = new (<any>window).talkify.TtsPlayer(); //or new talkify.Html5Player()
  }

  $onInit() {
    setTimeout(() => window['componentHandler'].upgradeAllRegistered(), 10);

    this.$document.on('keypress', () => this.takeSnapshot());

    this.widgetIframe = document.getElementById('sc-widget');
    this.loadLink(this.musicLink);
    this.widget  = (<any>window).SC.Widget(this.widgetIframe);

    // this.addPlayer();
    (<any>window).Webcam.set({
      width: 480,
      height: 360,
      image_format: 'png',
    });
    (<any>window).Webcam.attach( '#webcam' );

    this.$timeout(() => this.loading = false, 2000);
  }

  private loadLink(link: string, autoplay: boolean = false) {
    this.widgetIframe.src = `https://w.soundcloud.com/player/?url=${link}` +
      (autoplay ? scAutoplay : '');
  }

  takeSnapshot() {
    (<any>window).Webcam.snap((dataUri) => {
      this.annotateImage(dataUri);
      this.shot = dataUri;
    } );
  }

  async annotateImage(dataUri) {
    // const request =  {
    //   config: {
    //     encoding: 'LINEAR16',
    //     languageCode: 'en-US'
    //   },
    //   audio: {
    //     content: record
    //   }
    // };
    const response = await this.$http.post(gImageAPI, this.getImageRequest(dataUri));
    if (response.data) {
      const { responses } = response.data as any;
      if (responses && responses.length) {
        this.emotions = responses[0].faceAnnotations.map(face => {
          return this.parseEmotion(face);
        });
        const decision = Number(this.getDecision(this.emotions));

        // console.log(this.decision);
        if (decision != undefined) {
          this.decision = this.transform(decision);
          this.tts.playText(this.decision);
          this.loadLink(`http://soundcloud.com/voland/sets/${music[decision]}`, true);
        }
      }
    }
  }

  private getDecision(emotions: Emotion[]) {
    const resultMap = {};
    emotions.map(emotion => {
      if (emotion in resultMap) resultMap[emotion]++;
      else resultMap[emotion] = 1;
    });
    return Object.keys(resultMap).map(r => ({ key: r, count: resultMap[r]})).sort((a, b) => a.count - b.count)[0].key;
  }

  parseEmotion(face: any) {
    console.log(NO_SCORE);
    let emotion = Emotion.Neutral;
    if (NO_SCORE.indexOf(face.joyLikelihood) < 0) {
      emotion = Emotion.Happy;
    }
    else if (NO_SCORE.indexOf(face.sorrowLikelihood) < 0) {
      return Emotion.Sad;
    }
    else if (NO_SCORE.indexOf(face.headwearLikelihood) < 0) {
      emotion = Emotion.WearHat;
    }
    return emotion;
  }

  private getImageRequest(dataUri) {
    return {
      requests: [
        {
          image: {
            content: dataUri.split(',')[1]
          },
          features: [
            {
              type: 'FACE_DETECTION'
            },
            {
              type: 'LABEL_DETECTION'
            }
          ]
        }
      ]
    }
  }

  transform(emotion: Emotion) {
    switch (emotion) {
      case Emotion.Happy:
        return 'It seems that you are in a joyful mood, let me put some uplifting music for you';
      case Emotion.Sad:
        return 'It seems that you are not in the mood, let me put some calm music for you';
      case Emotion.WearHat:
        return 'It seems that you dig, let\'s put you some hiphop beats';
      case Emotion.Neutral:
      default:
        return 'You are kind of unemotional today, let\'s put you some neutral music';
    }
  }

//   private recognizeVoice() {
//     const request =  {
//       config: {
//         encoding: "LINEAR16",
//         languageCode: "en-US"
//       },
//       audio: {
//         // content: base64data.split(',')[1]
//       }
//     };
//
//     this.$http.post('https://speech.googleapis.com/v1/speech:recognize?key=AIzaSyAiVaMtky2S4SBREUq_e22TQR7MZQNQTjc', request)
//       .then(response => {
//         if (response.data) {
//           console.log(response.data);
//         }
//       });
// //     $.ajax({
// //       url: 'https://speech.googleapis.com/v1/speech:recognize?key=AIzaSyAiVaMtky2S4SBREUq_e22TQR7MZQNQTjc',
// //       type: 'post',
// //       // dataType: 'json',
// //       contentType: "application/json",
// //
// //       success: function (data) {
// //         const inputSpeech = data.results["0"].alternatives["0"].transcript;
// // // RESPONSE
// //         console.log('You said ' + inputSpeech);
// //
// //
// //
// //
// //
// //
// //       },
// //       data:  JSON.stringify(request)
// //     });
//   }
}

@Pipe({ name: 'emotionFilter'})
export class EmotionFilter {
  transform(emotion: Emotion) {
    switch (emotion) {
      case Emotion.Happy:
        return 'Happy';
      case Emotion.Sad:
        return 'Sad';
      case Emotion.WearHat:
        return 'Rapper';
      case Emotion.Neutral:
      default:
        return 'Neutral';
    }
  }
}

@Pipe({ name: 'decisionFilter'})
export class DecisionFilter {
  transform(emotion: Emotion) {
    switch (emotion) {
      case Emotion.Happy:
        return 'It seems that you are in a joyful mood, let\'s put you some uplifting music';
      case Emotion.Sad:
        return 'It seems that you are not in the mood, let\'s put you some calm music';
      case Emotion.WearHat:
        return 'Yo dawg, you dig, let\'s put you some hiphop beats';
      case Emotion.Neutral:
      default:
        return 'You are kind of unemotional today, let\'s put you some neutral music';
    }
  }
}
