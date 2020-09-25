window.customElements.define('video-recorder',
  class VideoRecorder extends HTMLElement{
    constructor(){
      super();
    }

    connectedCallback(){
      const shadowRoot = this.attachShadow({mode: 'open'});
      shadowRoot.appendChild(this.style);
      shadowRoot.appendChild(this.content);
      
      this.mediaRecorder = undefined;

      let startStopButton = this.shadowRoot.querySelector('#start-stop');
      startStopButton.addEventListener('click', (event) => {
        if(this.mediaRecorder && this.mediaRecorder.state === 'recording'){
          this.stop();
        }else{
          this.start();
        }
      });
    }

    get style(){
      let style = document.createElement('style');
      style.innerHTML = `
        .stop{
          background-color: red;
        }
      `;
      return style;
    }

    get content(){
      let content = document.createElement('div');
      content.innerHTML = `
      <h2>Video Preview</h2>
        <video id="preview" width="40%" autoplay muted playsinline></video>
        <br>
        <button id="start-stop">Start Recording</button>

      <h2>Video Recordings</h2>
      `;
      return content;
    }

    start(){
      let startStopButton = this.shadowRoot.querySelector('#start-stop');
      startStopButton.innerHTML = 'Stop Recording';
      startStopButton.classList.add('stop');

      let videoChunks = [];

      const constraints = {
        audio: true,
        video: true
      };

      // .webm video/webm
      // .mp4  video/mp4
      const options = {
        type: 'video/webm'
      };
        
      navigator.mediaDevices.getUserMedia(constraints)
        .then( (stream) => {
          let videoPreview = this.shadowRoot.querySelector('video#preview');
          videoPreview.srcObject = stream;

          this.mediaRecorder = new MediaRecorder(stream);
          this.mediaRecorder.addEventListener('dataavailable', (event) => {
            videoChunks.push(event.data);
          });
          this.mediaRecorder.addEventListener('stop', (event) => {
            this.saveRecording(new Blob(videoChunks, options));
          });
          this.mediaRecorder.start();
        })
        .catch( (error) => {
          console.error(`navigator.getUserMedia error: ${error}`);
        });
    }

    stop(){
      let startStopButton = this.shadowRoot.querySelector('#start-stop');
      startStopButton.innerHTML = 'Start Recording';
      startStopButton.classList.remove('stop');
      this.mediaRecorder.stop();
    }

    saveRecording(videoBlob){
      let blobUrl = URL.createObjectURL(videoBlob);
      let video = document.createElement('video');
      video.setAttribute('src', blobUrl);
      video.setAttribute('controls', '');
      this.shadowRoot.append(video);

      let a = document.createElement('a');
      a.setAttribute('href', blobUrl);
      a.setAttribute('download', `recording-${new Date().toISOString()}.webm`);
      a.innerText = 'Download';
      this.shadowRoot.append(a);
    }
  }
);
