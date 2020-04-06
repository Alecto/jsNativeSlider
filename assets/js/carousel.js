/*
 * @description
 *          Script creates a slide-show for structure .carousel>.slides>.slide[style=background-image:url()].
 * @author  Andrii.A.Fomenko
 * @revised 2020-04-06
 */

/* Super Class: Carousel */
function Carousel(containerID = '#carousel', slideID = '.slide') {
  this.container = document.querySelector(containerID);
  this.slideItems = this.container.querySelectorAll(slideID);

  this.interval = 2000;

  this._initProps();
  this._initControls();
  this._initIndicators();
  this._setListeners();
}

Carousel.prototype = {
  /* private, _initProps */
  _initProps: function () {

    this.slidesCount = this.slideItems.length;
    this.currentSlide = 0;
    this.isPlaying = true;

    this.KEY_SPACE = ' ';
    this.KEY_LEFT_ARROW = 'ArrowLeft';
    this.KEY_RIGHT_ARROW = 'ArrowRight';
    this.FA_PAUSE = '<i class="far fa-pause-circle"></i>';
    this.FA_PLAY = '<i class="far fa-play-circle"></i>';
    this.FA_PREV = '<i class="fas fa-angle-left"></i>';
    this.FA_NEXT = '<i class="fas fa-angle-right"></i>';
  },
  /* private, _initControls - dynamic creation of controls */
  _initControls: function () {
    let controls = document.createElement('div');
    const PAUSE = `<span id="pause-btn" class="control-pause">${this.FA_PAUSE}</span>`;
    const PREV = `<span id="prev-btn" class="control-prev">${this.FA_PREV}</span>`;
    const NEXT = `<span id="next-btn" class="control-next">${this.FA_NEXT}</span>`;

    controls.setAttribute('class', 'controls');
    controls.innerHTML = PAUSE + PREV + NEXT;

    this.container.appendChild(controls);

    this.pauseBtn = document.querySelector('#pause-btn');
    this.nextBtn = document.querySelector('#next-btn');
    this.prevBtn = document.querySelector('#prev-btn');
  },
  /* private, _initIndicators - dynamic creation of indicators */
  _initIndicators: function () {
    let generate = () => {
      let indicators = document.createElement('ol');

      indicators.setAttribute('class', 'indicators');

      for (let i = 0, n = this.slidesCount; i < n; i++) {
        let indicator = document.createElement('li');

        indicator.setAttribute('class', 'indicator');
        indicator.setAttribute('data-slide-to', `${i}`);
        i === 0 && indicator.classList.add('active');
        indicators.appendChild(indicator);
      }

      return indicators;
    };

    this.container.appendChild(generate());

    this.indContainer = this.container.querySelector('.indicators');
    this.indItems = this.container.querySelectorAll('.indicator');
  },
  /* private, _setListeners - set events to the elements */
  _setListeners: function () {
    document.addEventListener('keydown', this._pressKey.bind(this));
    this.pauseBtn.addEventListener('click', this.pausePlay.bind(this));
    this.nextBtn.addEventListener('click', this.next.bind(this));
    this.prevBtn.addEventListener('click', this.prev.bind(this));
    this.indContainer.addEventListener('click', this._indicate.bind(this));
  },
  /* private, _gotoNth */
  _gotoNth: function (n) {
    this.slideItems[this.currentSlide].classList.toggle('active');
    this.indItems[this.currentSlide].classList.toggle('active');
    this.currentSlide = (n + this.slidesCount) % this.slidesCount;
    this.slideItems[this.currentSlide].classList.toggle('active');
    this.indItems[this.currentSlide].classList.toggle('active');
  },
  /* private, _gotoNext */
  _gotoNext: function () {
    this._gotoNth(this.currentSlide + 1);
  },
  /* private, _gotoNext */
  _gotoPrev: function () {
    this._gotoNth(this.currentSlide - 1);
  },
  /* private, _pause */
  _pause: function () {
    if (this.isPlaying) {
      this.pauseBtn.innerHTML = this.FA_PLAY;
      this.isPlaying = !this.isPlaying;
      clearInterval(this.timerID);
    }
  },
  /* private, _play */
  _play: function () {
    this.pauseBtn.innerHTML = this.FA_PAUSE;
    this.isPlaying = !this.isPlaying;

    let that = this;

    this.timerID = setInterval(() => {
      that._gotoNext();
    }, this.interval);
  },
  /* private, _indicate */
  _indicate: function (e) {
    let target = e.target;

    if (target.classList.contains('indicator')) {
      this._pause();
      this._gotoNth(+target.getAttribute('data-slide-to'));
    }
  },
  /* private, _pressKey */
  _pressKey: function (e) {
    if (e.key === this.KEY_LEFT_ARROW) this.prev();
    if (e.key === this.KEY_RIGHT_ARROW) this.next();
    if (e.key === this.KEY_SPACE) this.pausePlay();
  },
  /* public, pausePlay */
  pausePlay: function () {
    this.isPlaying ? this._pause() : this._play();
  },
  /* public, next */
  next: function () {
    this._pause();
    this._gotoNext();
  },
  /* public, prev */
  prev: function () {
    this._pause();
    this._gotoPrev();
  },
  /* public, init carousel */
  init: function () {
    let that = this;

    this.timerID = setInterval(() => {
      that._gotoNext();
    }, this.interval);
  }
};

/* Sub Class: SwipeCarousel */
function SwipeCarousel (containerID = '#carousel', slideID = '.slide') {
  Carousel.apply(this, arguments);
}

// let superClass = Object.create(Carousel.prototype);
// let subClass = { method1: function() {console.log('method1')}, method2: function() {console.log('method2')} };
// SwipeCarousel.prototype = Object.assign(superClass, subClass);
SwipeCarousel.prototype = Object.create(Carousel.prototype);
SwipeCarousel.prototype.constructor = SwipeCarousel;

/* private, _setListeners - set events to the elements */
SwipeCarousel.prototype._setListeners = function () {
  Carousel.prototype._setListeners.apply(this);
  this.container.addEventListener('touchstart', this._swipeStart.bind(this));
  this.container.addEventListener('touchend', this._swipeEnd.bind(this));
};

/* private, _swipeStart */
SwipeCarousel.prototype._swipeStart = function (e) {
  this.swipeStartX = e.changedTouches[0].pageX;
};
/* private, _swipeEnd */
SwipeCarousel.prototype._swipeEnd = function (e) {
  this.swipeEndX = e.changedTouches[0].pageX;
  this.swipeStartX - this.swipeEndX > 100 && this.next();
  this.swipeStartX - this.swipeEndX < -100 && this.prev();
};
