import { Component, OnInit, ViewChild } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatMenuTrigger } from '@angular/material/menu';
import { MatTooltipDefaultOptions, MAT_TOOLTIP_DEFAULT_OPTIONS, TooltipPosition } from "@angular/material/tooltip";
export const myCustomTooltipDefaults: MatTooltipDefaultOptions = {
  showDelay: 200,
  hideDelay: 200,
  touchendHideDelay: 200,
}
@Component({
  selector: 'audio-player',
  templateUrl: './audio-player.component.html',
  styleUrls: ['./audio-player.component.scss'],
  providers: [{provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useValue: myCustomTooltipDefaults}],
})
export class AudioPlayerComponent implements OnInit {
  @ViewChild('orderList', { static: false }) orderList: MatMenuTrigger;
  index = 0;
  play: boolean = false;
  audio;
  newVolume: number = 0;
  list = [
    "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Chad_Crouch/Arps/Chad_Crouch_-_Shipping_Lanes.mp3",
    "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Tours/Enthusiast/Tours_-_01_-_Enthusiast.mp3",
    "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/WFMU/Broke_For_Free/Directionless_EP/Broke_For_Free_-_01_-_Night_Owl.mp3",
  ];
  positionOptions: TooltipPosition[] = ['below', 'above', 'left', 'right'];
  position = new FormControl(this.positionOptions[1]);

  ngOnInit(): void {
    this.playerInit(this.list[this.index]);
  }

  playerInit(audioTrack) {
    const audioPlayer = document.querySelector(".nav");
    this.audio = new Audio(
      audioTrack
    );
    this.audio.addEventListener(
      "loadeddata",
      (event) => {
        event.stopImmediatePropagation();
        audioPlayer.querySelector(".time .length").textContent = getTimeCodeFromNum(
          this.audio.duration
        );
        this.audio.volume = this.newVolume ? this.newVolume : .5;
      },
      false
    );
    const timeline = audioPlayer.querySelector(".timeline-wrap");
    const progressBar = audioPlayer.querySelector(".progress");
    timeline.addEventListener("click", (e) => {
      e.stopImmediatePropagation();
      const timelineWidth = window.getComputedStyle(timeline).width;
      const timeToSeek = (e as any).offsetX / parseInt(timelineWidth) * this.audio.duration;
      this.audio.currentTime = timeToSeek;
    }, false);
    const volumeSlider = audioPlayer.querySelector(".controls .volume-slider-wrap");
    volumeSlider.addEventListener('click', e => {
      const sliderWidth = window.getComputedStyle(volumeSlider).width;
      this.newVolume = (e as any).offsetX / parseInt(sliderWidth);
      this.audio.volume = this.newVolume;
      (audioPlayer.querySelector(".controls .volume-percentage") as any).style.width = this.newVolume * 100 + '%';
      console.log(this.audio.volume);
    }, false)
    setInterval(() => {
      const progressCircle = audioPlayer.querySelector(".circle");
      (progressBar as any).style.width = this.audio.currentTime / this.audio.duration * 100 + "%";
      audioPlayer.querySelector(".time .current").textContent = getTimeCodeFromNum(
        this.audio.currentTime
      );
      if (this.audio.currentTime) {
        (progressCircle as any).style.width = 12 + "px";
      } else {
        (progressCircle as any).style.width = 0;
      }
    }, 500);
    const playBtn = document.querySelector(".toggle-play");
    playBtn.addEventListener(
      "click",
      (event) => {
        event.stopImmediatePropagation();
        this.play = !this.play;
        if (this.audio.paused) {
          this.audio.play();
        } else {
          this.audio.pause();
        }
      },
      false
    );
    audioPlayer.querySelector(".volume-button").addEventListener("click", (event) => {
      event.stopImmediatePropagation();
      this.audio.muted = !this.audio.muted;
    });
    function getTimeCodeFromNum(num) {
      let seconds = parseInt(num);
      let minutes = parseInt((seconds / 60) as any);
      seconds -= minutes * 60;
      const hours = parseInt((minutes / 60) as any);
      minutes -= hours * 60;

      if (hours === 0) return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
      return `${String(hours).padStart(2, '0')}:${minutes}:${String(
        seconds % 60
      ).padStart(2, '0')}`;
    }
  }

  previous() {
    this.index--;
    this.setPlayerState();
  }

  next() {
    this.index++;
    this.setPlayerState();
  }

  setPlayerState() {
    this.audio.pause();
    this.playerInit(this.list[this.index]);
    if (this.play) {
      this.audio.play();
    }
  }
}
