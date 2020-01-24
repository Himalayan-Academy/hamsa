<style>
  .hero {
    position: relative;
    height: 370px;
    max-height: 370px;
    overflow: hidden;
  }

  .hero1 {
    position: absolute;
    left: 0px;
    background-color: #000;
    overflow: hidden;
    width: 100%;
    height: 370px;
    max-width: 100%;
    background-image: url(images/hero2.jpg);
    background-size: fill;
    background-repeat: no-repeat;
    background-position: center;
  }

  .hero2 {
    position: absolute;
    left: 0px;
    background-color: #005aa0;
    overflow: hidden;
    width: 100%;
    max-width: 100%;
    height: 370px;
    background-size: fill;
    background-repeat: no-repeat;
    background-position: center;
    background-image: url(images/hero1.jpg);
  }
</style>

<div>
  <div class="hero">
    <figure class="hero1" />
    <figure class="hero2" />
  </div>
</div>
