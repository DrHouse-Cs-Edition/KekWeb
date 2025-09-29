class TimeMachine extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <style>
        .tm-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: #222;
          color: white;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
          font-family: sans-serif;
          z-index: 10002; /* maggiore della navbar */
        }
        .tm-bar input {
          width: 60px;
          padding: 3px;
        }
        .tm-bar button{
          color: white;
          border: none;
          padding: 5px 10px;
          border-radius: 6px;
          cursor: pointer;
        }
        .tm-submit {
          background: #2563eb;
        }
        .tm-reset {
          background: #dc2626;
        }
        @media only screen and (max-width: 768px) {
          .tm-timeDescription {
            display: none
          }
          .tm-bar {
            flex-wrap: wrap; /* manda a capo gli elementi */
          }
          .tm-bar button {
            flex: 1; /* i bottoni si allargano */
          }
        }
      </style>
      <div class="tm-bar">
        <span>🕰️ Time Machine:</span>
        <input type="number" id="days" placeholder="Giorni" />
        <input type="number" id="hours" placeholder="Ore" />
        <input type="number" id="minutes" placeholder="Minuti" />
        <button id="submit" class="tm-submit">Invia</button>
        <button id="reset" class="tm-reset">Reset</button>
        <p class="tm-timeDescription">Orario del server:</p>
        <p id="tm-time"></p>
      </div>
    `;
  }

  connectedCallback() {
    this.getDate();
    this.shadowRoot.getElementById("submit").addEventListener("click", () => this.submit());
    this.shadowRoot.getElementById("reset").addEventListener("click", () => this.reset());
    setInterval(() => {console.log("date click"); this.getDate();}, 10000); // ogni 10000 ms = 10 s
  };

  async submit() {
    const days = this.shadowRoot.getElementById("days").value || 0;
    const hours = this.shadowRoot.getElementById("hours").value || 0;
    const minutes = this.shadowRoot.getElementById("minutes").value || 0;
    const totalMinutes = (days * 1440) + (hours * 60) + parseInt(minutes);

    try {
      const res = await fetch("http://localhost:5000/api/timeMachine/travel", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ minutes: totalMinutes }),
      });
      const json = await res.json();
      if (json.success) {
        alert(`Hai viaggiato di: ${days}g ${hours}h ${minutes}m`);
        const localDate = this.dateFormat(new Date(json.date));
        this.shadowRoot.getElementById("tm-time").innerText = localDate;
      }
      else{
        console.log("sucess submit = false");
      }
    } catch (err) {
      console.error("Errore submit: ", err);
    }
  }

  async reset() {
    try {
      const res = await fetch("http://localhost:5000/api/timeMachine/reset", {
        method: "PUT",
        credentials: "include",
      });
      const json = await res.json();
      if (json.success) {
        alert("Data resettata al valore normale");
        const localDate = this.dateFormat(new Date(json.date));
        this.shadowRoot.getElementById("tm-time").innerText = localDate;

      }
      else{
        console.log("sucess reset = false");
      }
    } catch (err) {
      console.error("Errore reset: ", err);
    }
  }

  async getDate(){
    try {
      const response = await fetch("http://localhost:5000/api/timeMachine/date", {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const json = await response.json();
      if (json.success) {
        const localDate = this.dateFormat(new Date(json.date));
        this.shadowRoot.getElementById("tm-time").innerText = localDate;
      }
      else{
        console.log("Non siamo riusciti a ottenere la data dal server per la TM");
      }
    } catch (err) {
      console.error("Errore getDate: ", err);
    }
  }

  dateFormat(date){
    return date.toLocaleDateString('it-IT') + ", " + date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  }

}

if (!customElements.get("time-machine")) {
  customElements.define("time-machine", TimeMachine);
}