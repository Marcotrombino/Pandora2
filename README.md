# Pandora2
Edit your images with Javascript like a real DIP software applying adjustments, filters, presets and more. 
<br>Behind the scene HTML5 Canvas allows to process every single pixel and make awesome effects which you can use with simple lines of code!
###What's new
Built from [Pandora](https://github.com/Marcotrombino/Pandora)'s idea, <b>Pandora2</b> offers developers more flexibility and control. Now you can handle every aspect of your canvas directly from your scripts.
##Preload 
Be sure to preload your images
```js
var images = Pandora.load(["test.jpg"]); // images[0] = <img src="test.jpg">
```

##Setup
Init your Document: 
```js
window.onload = function() {
  var preview = new Pandora.Document({source: images[0]});
}
```
###Output
You can choose your Document's output by setting its init configuration:
```js
var preview = new Pandora.Document({source: images[0], destID: "canvasID"});
```
Or maybe you just want to process your Document in off-screen and get an output url:
```js
var preview = new Pandora.Document({source: images[0]});
var url = preview.export(); // return a Base64 url
```
##Use
Start to process your document with main functions:
* `adjust(adjustment, params)`
* `filter(filter, params)`
* `fill(params)`
* `blur(params)`
* `preset(preset)`

Here's a quick example:
```js
preview.adjust("brightness", [10]); // Increase document brightness by 10
```
Let's see how the whole code appears: 
```js
var images = Pandora.load(["test.jpg"]);
window.onload = function() {
  var preview = new Pandora.Document({destID: "canvasID", source: images[0]});
  preview.adjust("brightness", [10]);
}
```

Check out the [Wiki](https://github.com/Marcotrombino/Pandora2/wiki) to see all documentation


