const path = require("path");
const fse = require("fs-extra");//fs 扩展包
//合并文件块
const UPLOAD_DIR = path.resolve(__dirname, "target");
// console.log(UPLOAD_DIR)
const filename = 'yb';
const filepath = path.resolve(UPLOAD_DIR, "..", `${filename}.jpeg`);
// console.log(filepath)

const pipeStream = (path, writeStream) =>
  new Promise(resolve => {
    const readStream = fse.createReadStream(path);
    readStream.on("end", ()=>{
      fse.unlinkSync(path);
      resolve();
    })
    readStream.pipe(writeStream)
  })

const mergeFileChunk = async (filePath, filename, size) => {
  // console.log(filepath, filename, size)
  const chunkDir = path.resolve(UPLOAD_DIR, filename)
  const chunkPaths = await fse.readdir(chunkDir);
  // console.log(chunkPaths)
  chunkPaths.sort((a, b)=>a.split("-")[1]-b.split("-")[1])
  await Promise.all(
    chunkPaths.map((chunkPath, index)=>
      pipeStream(
        path.resolve(chunkDir, chunkPath),
        fse.createWriteStream(filePath, {
          start: index * size,
          end: (index + 1)*size
        })
      )
    )
  )
  console.log("文件合并成功")
  fse.rmdirSync(chunkDir)
}
mergeFileChunk(filepath, filename, 0.5*1024*1024);