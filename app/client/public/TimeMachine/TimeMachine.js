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
          z-index: 1000;
          font-family: sans-serif;
          z-index: 10002; /* maggiore della navbar */
        }
        .tm-bar input {
          width: 60px;
          padding: 3px;
        }
        .tm-bar button {
          background: #2563eb;
          color: white;
          border: none;
          padding: 5px 10px;
          border-radius: 6px;
          cursor: pointer;
        }
        .tm-bar button.reset {
          background: #dc2626;
        }
        @media (max-width: 600px) {
          .tm-bar {
            flex-wrap: wrap; /* manda a capo gli elementi */
          }
          .tm-bar button {
            flex: 1;              /* i bottoni si allargano */
            min-width: 80px;
          }
        }
      </style>
      <div class="tm-bar">
        <span>🕰️ Time Machine:</span>
        <input type="number" id="days" placeholder="Giorni" />
        <input type="number" id="hours" placeholder="Ore" />
        <input type="number" id="minutes" placeholder="Minuti" />
        <button id="submit">Invia</button>
        <button id="reset" class="reset">Reset</button>
      </div>
    `;
  }

  connectedCallback() {
    this.shadowRoot.getElementById("submit")
      .addEventListener("click", () => this.submit("days", "hours", "minutes"));
    this.shadowRoot.getElementById("reset")
      .addEventListener("click", () => this.reset());
  }

  async submit(dId, hId, mId) {
    const days = this.shadowRoot.getElementById(dId).value || 0;
    const hours = this.shadowRoot.getElementById(hId).value || 0;
    const minutes = this.shadowRoot.getElementById(mId).value || 0;
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
      }
    } catch (err) {
      console.error("Errore submit:", err);
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
      }
    } catch (err) {
      console.error("Errore reset:", err);
    }
  }
}

if (!customElements.get("time-machine")) {
  customElements.define("time-machine", TimeMachine);
}