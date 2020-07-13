import axios from 'axios';

export default axios.create({
  baseURL: "http://localhost:1234/",
  headers: {
    "Content-type": "application/json"
  }
});
