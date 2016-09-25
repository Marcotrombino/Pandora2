# Pandora2
Edit your images with Javascript like a real DIP software applying adjustments, filters, presets and more. 
<br>Behind the scene HTML5 Canvas allows to process every single pixel and make awesome effects which you can use with simple lines of code!
###What's new
<br>Built from [Pandora](https://github.com/Marcotrombino/Pandora)'s idea, <b>Pandora2</b> offers developers more flexibility and control. Now you can handle every aspect of your canvas directly from your scripts.
##Setup
Init your Document with a simple line of code:
```js
var preview = new Pandora.Document({source: image});
```
###Output
You can choose your Document's output by setting its init configuration:
```js
var preview = new Pandora.Document({source: image, destID: canvasID});
```
Or maybe you just want to process your Document in off-screen and get an output url:
```js
var preview = new Pandora.Document({source: image});
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
Check out the [Wiki](https://github.com/Marcotrombino/Pandora2/wiki) to see all documentation


