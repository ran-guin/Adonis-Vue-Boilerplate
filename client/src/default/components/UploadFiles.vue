<template lang="pug">
  div(max-width='500px')
    div(v-if='currentFile')
      div
        v-progress-linear(v-model='progress' color='light-blue' height='25' reactive='')
          strong {{ progress }} %
    div(v-if='imageNames.length')
      div(v-for='imageName in imageNames')
        img(:src='imageName' :width='myWidth')
        a(@click='myWidth="100%"')
          v-icon() zoom_in
        a(@click='myWidth=width')
          v-icon() zoom_out
        br
      p &nbsp;
      hr
      v-row.justify-space-around(v-if='onSave')
        v-btn.btn-primary.centred(@click='saveImage' v-if='onSave')  Save 
        //- v-row.justify-space-around()        
        v-btn.btn-primary.centred(@click='imageNames=[]' small)
          v-icon mdi-close
        h3.error(v-if='message') {{message}}

    div(v-else-if='pickList')
      v-card(max-width='800px')
        v-container
          h4
            | Current Image List
            a.right(@click='pickList=false')
              v-icon close
          ul
            li(v-if='fileInfos.length === 0') No files currently available
            li(v-for='(F, file) in fileInfos' :key='file')
              a(v-for='t in fTypes' v-if='F[t]' @click='pickImage(F[t])')
                img(:src='targetDirectory + F[t]' width='300px')
            v-btn(@click='pickList=false')  Cancel 
    div(v-else='')
      v-row(no-gutters='' justify='center' align='center')
        v-col(cols='8' v-if='!pickList')
          //- v-file-input#files(ref='files' show-size='' label='File input' @change='selectFile()' prepend-icon='camera' multiple)
          div(v-cloak @drop.prevent="addDropFile" @dragover.prevent)
            v-file-input(v-model='files' show-size='' :label='label' @change='selectFile()' prepend-icon='camera' :multiple='multiple')
        v-col.pl-2(cols='4' v-if='!pickList')
          v-btn.btn-primary(small='' @click='upload')
            //- span(v-if='onSave') Upload
            span(v-if='onResize') Resize
            v-icon(right='' dark='') cloud_upload
      v-row(no-gutters='' justify='center' align='center' v-if='targetDirectory')
        v-col(cols='12')
          v-btn.btn-primary(x-small='' @click='pick')
            | Pick from Existing Images
      v-alert(v-if='message' border='left' color='lightgreen')
        | {{ message }}
      //- v-card.mx-auto(v-if='fileInfos.length > 0 && !targetDirectory')
      //-   v-list
      //-     v-subheader List of Files
      //-     v-list-item-group(color='primary')
      //-       v-list-item(v-for='(file, index) in fileInfos' :key='index')
      //-         a(:href='file.url') {{ file.name}}
</template>

<script>
// import UploadService from "@/services/UploadFilesHttpService";
import axios from 'axios'

export default {
  name: "upload-files",
  data() {
    return {
      currentFile: undefined,
      progress: 0,
      message: "",
      fileInfos: [],
      pickList: false,
      imageNames: [],
      altImage: '',
      fTypes: ['svg', 'jpeg', 'jpg', 'png', 'gif'],
      myWidth: '300px',
      files: [],
      uploaded: []
    };
  },
  props: {
    clientDirectory: {
      type: String,
      default: 'tmp/resized/'
    },
    serverDirectory: {
      type: String,
      default: 'tmp/uploads/'
    },
    targetDirectory: {
      type: String
    },
    width: {
      type: String,
      default: '300px'
    },
    onSave: {
      type: Function
    },
    onResize: {
      type: Function
    },
    onPick: {
      type: Function
    },
    quality: {
      type: Number
    },
    size: {
      type: String
    },
    multiple: {
      type: Boolean,
      default: false
    },
    format: {
      type: String,
      default: ''
    },
    search: {
      type: String,
      default: ''
    },
    label: {
      type: String,
      default: 'Pick File'
    },
    autoUpload: {
      type: Boolean,
      default: false
    }
  },
  computed: {
  },
  methods: {
    addDropFile(e) { 
      this.files = e.dataTransfer.files[0]
    },
    pickImage: function (file) {
      this.pickList = false
      this.existing = file
      console.log('set image to ' + file)
      this.imageNames = [this.targetDirectory + file]
      this.message = '';
      if (this.onPick) {
        this.onPick(file)
      }
    },
    saveImage: function () {
      console.log('save image ...')
      this.message = 'Save ...';

      if (this.uploaded.length) {
        for (var i = 0; i < this.uploaded.length; i++) {
          var filename = this.uploaded[i]
          console.log('move ' + filename + ' from ' + this.clientDirectory + ' to ' + this.targetDirectory)
          var data = {
            file: filename,
            from: this.clientDirectory,
            to: this.targetDirectory
          }
          axios.post('/moveFile', data)
        }
      }

      if (this.onSave) {
        if (this.multiple) {
          var images = this.imagesNames.map(a => a.replace(this.clientDirectory, this.targetDirectory))
          this.onSave(images)
        } else {
          this.onSave(this.imageNames[0].replace(this.clientDirectory, this.targetDirectory))
        }
      } else {
        console.log('no save function supplied')
      }
    },
    resizeImage: function () {
      console.log('resize..')
      this.message = 'Resize...';

      if (this.onResize) {
        if (this.multiple) {
          this.onResize(this.imageNames)
        } else {
          this.onResize(this.imageNames[0])
        }
      } else {
        console.log('no resize function supplied')
      }
    },
    selectFile: function (e) {
      // this.files = e.target.files || e.dataTransfer.files
      // this.files = this.$refs.files.files;
      // this.progress = 0;
      // this.currentFile = file;
      // this.message = '';
      // if (this.$refs.files) {
      //   console.log(' REFS FOUND...')
      //   if (this.$refs.files) {
      //     this.files = this.$refs.files.files
      //     console.log(' FILES FOUND...')
      if (this.files) {
        console.log(this.files.length + ' FILES...')

        if (this.autoUpload) {
          this.upload()
        }
      } else {
        this.files = [e]
        console.log('no multiple files found')
      }
      //   }
      // } else {
      //   console.log('no multiple files')
      //   this.files = [this.currentFile]
      // }

    },
    async upload () {
      this.message = "";

      var formData = new FormData();
      formData.append('size', this.size || 'medium')
      formData.append('quality', this.quality || 80)
      formData.append("clientDirectory", this.clientDirectory)

      var uploadData = {
        size: this.size || 'medium',
        quality: this.quality || 80,
        clientDirectory: this.clientDirectory
      }

      uploadData.files = this.files

      if (this.multiple && this.files.length > 1) {  
        for (var i = 0; i < this.files.length; i++) {
          formData.append("files", this.files[i]);
        }
      } else if (this.files.length) {
          formData.append("file", this.files[0]);
          console.log('File Data: ' + JSON.stringify(formData))
      } else {
        console.log('no file selected...')
        this.message = "Please select a file! ";
        return;
      }

      console.debug('Upload Data: ' + JSON.stringify(uploadData))
      console.debug('Upload Form Data: ' + JSON.stringify(formData))

      this.uploaded = ''
      axios.post('/upload', formData, 
        {
          headers: {
            "Content-Type": "multipart/form-data"
          },
          onUploadProgress: function (event) {
            // UploadService.upload(formData, (event) => {
            console.log('update progress... ')
            this.progress = Math.round((100 * event.loaded) / event.total);
            console.log('progress updated...')
          }.bind(this)
        })
        .then((response) => {
          console.log('upload response: ' + JSON.stringify(response.data))
          this.message = response.data.message
          this.uploaded = response.data.resized
          this.altImage = response.data.altFile

          setTimeout( () => {
            this.imageNames = this.uploaded.map(a => this.clientDirectory + a)
          }, 1000)
        })
        .catch((err) => {
          console.log('Err: ' + err.message)
          console.log('Status ' + err.status)

          if (err.message.match(/code 413/)) {
            err.message = 'File too large'
          } else {
            err.message = 'Problem uploading (ensure ext is gif, jpg, jpeg or png)'
          }
          this.progress = 0;
          this.message = err.status + " Could not upload the file! " + err.message;

          this.currentFile = undefined;
        });
    },
    getFiles: function () {
      var url = "/files?dir=" + this.targetDirectory + '&format=' + this.format + '&search=' + this.search
      console.log('search for files: ' + url)
      axios.get(url)
        .then( response => {
          this.fileInfos = response.data;
          console.log('RESP' + JSON.stringify(response))
          console.log('loaded ' + this.fileInfos.length + ' files')
        })
        .catch (err => {
          console.log('could not retrieve files (?) ' + err.message)
        });
    },
    srcWidth: function (width) {
      return '(max-width: ' + width + 'px)'
    },
    pick: function () {
      this.getFiles()
      this.pickList = true
    }
  },
  created() {
    this.myWidth = this.width
  },
  mounted() {
    // if (this.targetDirectory) {
    //   this.getFiles()
    // }
  },
  watch: {
    targetDirectory: function () {
      console.log('load image files from ' + this.targetDirectory)
      if (this.targetDirectory) {
        this.getFiles(this.targetDirectory)
      }
    },
    imageName: function () {
      console.log("image name changed...")
    }
  }
};
</script>

<style scoped>

.v-text-field__slot {
  -webkit-transition: all 0.30s ease-in-out;
  -moz-transition: all 0.30s ease-in-out;
  -ms-transition: all 0.30s ease-in-out;
  -o-transition: all 0.30s ease-in-out;
  transition: all 0.30s ease-in-out;
  outline: none;
  padding: 3px 0px 3px 3px;
  margin: 5px 1px 3px 0px;
  border: 1px solid #DDDDDD;
}
 
.v-text-field_slot :focus, textarea:focus {
  box-shadow: 0 0 5px rgba(81, 203, 238, 1);
  padding: 3px 0px 3px 3px;
  margin: 5px 1px 3px 0px;
  border: 1px solid rgba(81, 203, 238, 1);
}
</style>
