(() => {
  const TWO_PI      = Math.PI * 2;

  const canvas      = document.createElement('canvas');
  const ctx         = canvas.getContext('2d');
  let w             = canvas.width;//  = innerWidth;
  let h             = canvas.height;// = innerHeight;
  let canvasColor   = 'yellow';//'rgba(0,0,0,0)';//`#232332`;

  let mx            = 0;
  let my            = 0;
  let toggle        = 0;
  let circles       = [];
  let circlesCount  = 2;
  const stepLength  = 2;
  const maxOffset   = 6;
  const maxLength   = 800;

  class Circle {
    constructor(x, y) {
      this.x = x || Math.random() * w;
      this.y = y || Math.random() * h;
    }

    draw(x, y) {
      this.x = x || this.x;
      this.y = y || this.y;

      ctx.lineWidth     = 1.5;
      ctx.fillStyle     = 'white';
      ctx.strokeStyle   = 'blue';

      ctx.beginPath();
      ctx.arc(this.x, this.y, 3, 0, TWO_PI);
      ctx.closePath();
      ctx.fill();

      /*ctx.beginPath();
      ctx.arc(this.x, this.y, 32, 0, TWO_PI);
      ctx.closePath();
      ctx.stroke();*/
    }
  }

  function createLightning() {
    for (let a = 0; a < circles.length; a++) {
      for (let b = a + 1; b < circles.length; b++) {
        let dist = getDistance(circles[a], circles[b]);
        let chance = dist / maxLength;
        if (chance > Math.random()) continue;

        let otherColor    = chance * 255;
        let stepsCount    = dist / stepLength;
        let sx            = circles[a].x;
        let sy            = circles[a].y;

        ctx.lineWidth     = 2.5;
        ctx.strokeStyle   = '#ffffff';//`rgb(255, ${otherColor}, ${otherColor})`;

        ctx.beginPath();
        ctx.moveTo(circles[a].x, circles[a].y);
        for ( let i = stepsCount; i > 1; i--) {
          let pathLength  = getDistance(circles[a], {x: sx, y: sy});
          let offset      = Math.sin(pathLength / dist * Math.PI) * maxOffset;

          sx += (circles[b].x - sx) / i + Math.random() * offset * 2 - offset;
          sy += (circles[b].y - sy) / i + Math.random() * offset * 2 - offset;

          ctx.lineTo(sx, sy);
        }
        ctx.stroke();
      }
    }
  }

  function getDistance(a, b) {
    return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
  }

  /*window.onkeypress = () => {
    toggle == circles.length - 1? toggle = 0 : toggle++;
  }*/

  /*canvas.onmousemove = e => {
    mx = e.x - canvas.getBoundingClientRect().x;
    my = e.y - canvas.getBoundingClientRect().y;
  }*/

  function init() {
    //canvas.style.background = canvasColor;
    document.querySelector('.header__heading').appendChild(canvas);
    let x = 1;
    for (let i = 0; i < circlesCount; i++) {

      circles.push( new Circle(x, h/2) );
      x += w;
    }
  }

  function loop() {
    ctx.clearRect(0, 0, w, h);

    createLightning();
    circles.map(i => {  i == circles[toggle]? i.draw(mx, my) : i.draw(); });

    requestAnimationFrame(loop);
  }

  init();
  loop();
})();
