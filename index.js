/*const app = require("./src/app");
app.listen(3000, () => {
  console.log(":3000");
});*/

async function a() {
  console.log((await require("./src/apis/mavapis").TRAIN({ number: 2638 })).d.result.html);
}

a();