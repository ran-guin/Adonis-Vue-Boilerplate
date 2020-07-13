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
    console.debug('get files/env via http API...' + dir)
    return http.get("/files?dir=" + dir);
  }
}

export default new UploadFilesHttpService();

