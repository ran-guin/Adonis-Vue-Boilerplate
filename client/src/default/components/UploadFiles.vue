<template>
  <div>
    <div v-if="currentFile">
      <div>
        <v-progress-linear
          v-model="progress"
          color="light-blue"
          height="25"
          reactive
        >
          <strong>{{ progress }} %</strong>
        </v-progress-linear>
      </div>
    </div>

    <div v-if='pickedImage'>
      <img :src='imageName' :width='width' />
      <!-- <picture>
        <source type="image/webp" :src="imageName" :width='width'/>
        <source type="image/jpeg" :src="altName" :width='width'/>
      </picture> -->
      <v-row class='justify-space-around' v-if='onSave'>
        <v-btn class='btn-primary centred' @click='saveImage' x-small> Save </v-btn>
        <v-btn class='btn-primary centred' @click='pickedImage=""' x-small>
          <v-icon>edit</v-icon>
        </v-btn>
      </v-row>
    </div>
    <div v-else-if='pickList'>
      <v-card max-width='800px'>
        <v-container>
          <h4>Current Image List
            <a class='right' @click='pickList=false'>
              <v-icon>close</v-icon>
            </a>
          </h4>
          <ul>
            <li v-for="(file, index) in fileInfos" :key='index'>
              <a @click='pickImage(file)'>
                <img :src='directory + file + ".webp"' width='40%'/>
                <!-- <picture>
                  <source type="image/webp" :src='directory + file + ".webp"' :width='width'/>
                  <source type="image/jpeg" :src='directory + file + ".jpeg"' :width='width'/>
                </picture> -->

              </a>
            </li>
            <v-btn @click='pickList=false'> Cancel </v-btn>
          </ul>
        </v-container>
      </v-card>
    </div>
    <div v-else>
      <v-row no-gutters justify="center" align="center">
        <v-col cols="8" v-if='!pickList'>
          <v-file-input
            show-size
            label="File input"
            @change="selectFile"
          ></v-file-input>
        </v-col>

        <v-col cols="4" class="pl-2" v-if='!pickList'>
          <v-btn class='btn-primary' small @click="upload">
            Upload
            <v-icon right dark>camera</v-icon>
          </v-btn>
        </v-col>
      </v-row>

      <v-row no-gutters justify="center" align="center" v-if='directory'>
        <v-col cols="12">
          <v-btn class='btn-primary' x-small @click="pickList=true">
            Pick from Existing Images
          </v-btn>
        </v-col>
      </v-row>

      <v-alert v-if="message" border="left" color="lightgreen">
        {{ message }}
      </v-alert>

      <v-card v-if="fileInfos.length > 0 && !directory" class="mx-auto">
        <v-list>
          <v-subheader>List of Files</v-subheader>
          <v-list-item-group color="primary">
            <v-list-item v-for="(file, index) in fileInfos" :key="index">
              <a :href="file.url">{{ file.name}}</a>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-card>
    </div>
  </div>
</template>

<script>
import UploadService from "@/services/UploadFilesHttpService";
export default {
  name: "upload-files",
  data() {
    return {
      currentFile: undefined,
      progress: 0,
      message: "",
      fileInfos: [],
      pickList: false,
      pickedImage: '',
      altImage: ''
    };
  },
  props: {
    directory: {
      type: String
    },
    width: {
      type: String,
      default: '300px'
    },
    onSave: {
      type: Function
    }
  },
  computed: {
    imageName: function () {
      return this.directory + this.pickedImage
    },
    altName: function () {
      return this.directory + this.altImage
    }

  },
  methods: {
    pickImage: function (file) {
      this.pickList = false
      this.existing = file
      console.log('set image to ' + file)
      this.pickedImage = file
      this.message = '';
    },
    saveImage: function () {
      this.onSave(this.pickedImage)
      this.message = '';
    },
    selectFile: function (file) {
      this.progress = 0;
      this.currentFile = file;
      this.message = '';
    },
    async upload () {
      if (!this.currentFile) {
        this.message = "Please select a file! ";
        return;
      }
      this.message = "";
      console.log('upload ' + this.currentFile)
      UploadService.upload(this.currentFile, (event) => {
        this.progress = Math.round((100 * event.loaded) / event.total);
      })
        .then((response) => {
          this.message = response.data.message
          this.pickedImage = response.data.filename
          this.altImage = response.data.altFile

          console.log('recall getFiles')
          return UploadService.getFiles(this.directory);
        })
        .then((files) => {
          console.log('reset files.data:')
          this.fileInfos = files.data;
        })
        .catch((err) => {
          this.progress = 0;
          this.message = "Could not upload the file! " + err.message;
          this.currentFile = undefined;
        });
    },
  },
  mounted() {
    UploadService.getFiles(this.directory)
      .then( response => {
        this.fileInfos = response.data;
        console.log('RESP' + JSON.stringify(response))
        console.log('loaded ' + this.fileInfos.length + ' files')
      })
      .catch (err => {
        console.log('could not retrieve files (?) ' + err.message)
      });
  },
};
</script>
