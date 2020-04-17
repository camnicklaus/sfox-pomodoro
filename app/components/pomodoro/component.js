import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class PomodoroComponent extends Component {
  alarm = new Audio('http://soundbible.com/grab.php?id=595&type=mp3');
  maxPomOptions = [
    { value: 2, label: '2 poms' },
    { value: 4, label: '4 poms' },
    { value: 6, label: '6 poms' },
    { value: 8, label: '8 poms' },
    { value: 10, label: '10 poms' },
  ];

  @tracked timerRef;
  @tracked poms = [];
  @tracked maxPoms = 4;
  @tracked currentTime = this.initializedWorkTime;
  @tracked currentBreakTime = this.initializedBreakTime;
  @tracked initializedWorkTime = 1500;
  @tracked initializedBreakTime = 180;
  @tracked workMode = true;

  // use this to speed up the timer for smoke testing
  @tracked clockSpeed = 1;

  get displayTime() {
    return this.workMode ? this.toMMSS(this.currentTime) : this.toMMSS(this.currentBreakTime);
  }

  toMMSS(value) {
    let totalTime = parseInt(value, 10);
    let minutes = Math.floor(totalTime / 60);
    let seconds = totalTime - (minutes * 60);

    if (minutes < 10) {
      minutes = `0${minutes}`;
    }
    if (seconds < 10) {
      seconds = `0${seconds}`;
    }
    return `${minutes}:${seconds}`;
  }

  @action
  setClockSpeed({ target }) {
    this.clockSpeed = Number(target.value);
    if (this.timerRef) {
      this.stopTimer();
      this.startTimer();
    }
  }

  @action
  setTime(mode, { target }) {
    if (mode === 'work') {
      this.currentTime = target.value;
      this.workMode = true;
      this.initializedWorkTime = target.value;
      return;
    }
    this.currentBreakTime = target.value;
    this.workMode = false;
    this.initializedBreakTime = target.value;
  }

  @action
  timer() {
    let currentTime = this.workMode ? this.currentTime : this.currentBreakTime;
    // decrement timer but only to 0 or if poms are less that max;
    if (currentTime <= 0 || this.poms.length >= this.maxPoms) {
      this.clearTimer();
      return;
    }
    this.workMode ? this.currentTime -- : this.currentBreakTime --;
  }

  @action
  startTimer() {
    if (this.timerRef) {
      return
    }
    this.timerRef = setInterval(this.timer, 1000 / this.clockSpeed);
  }

  @action
  stopTimer() {
    clearInterval(this.timerRef);
    this.timerRef = null;
  }

  @action
  clearTimer() {
    this.currentTime = this.initializedWorkTime;
    this.currentBreakTime = this.initializedBreakTime;

    if (this.timerRef) {
      this.alarm.volume = 0.4;
      this.alarm.play();

      if (this.poms.length >= this.maxPoms) {
        this.poms = [];
        return this.stopTimer();
      }

      if (this.workMode) {
        this.poms = [...this.poms, this.poms.length + 1];
      }
      this.workMode = !this.workMode;
    }
  }

  @action
  setMaxPoms({ target }) {
    let opt = this.maxPomOptions.find(opt => opt.value === +target.value)
    this.maxPoms = parseFloat(opt.value)
  }

  @action
  resetPomodoro() {
    this.stopTimer();
    this.clearTimer();
    this.poms = [];
  }
}
