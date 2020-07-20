import http from "@/http-common";

class UploadFilesHttpService {
  upload(file, onUploadProgress) {
    let formData = new FormData();
    
    formData.append("file", file);

    console.debug('send file: ' + file.constructor)
    console.debug(JSON.stringify(file))
    console.debug('Upload Files via http API...')

    return http.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      },
      onUploadProgress
    });
  }

  getFiles(dir) {
    var directory = dir || ''
    console.debug('get files via http API...' + directory)
    return http.get("/files?dir=" + directory);
  }
}

export default new UploadFilesHttpService();

