// ==UserScript==
// @name         Pagina de corrida com automatizações de registro de caso e verificação de desconto de tarifas em um clique DEV
// @namespace    http://tampermonkey.net/
// @version      3.5
// @description  Pagina de corrida com automatizações para verificação de tarifas e registros de casos
// @match        *://*/*
// @grant        none
// @author       Mateus
// ==/UserScript==

(function () {
    'use strict';

    let checkInterval = null;
    let h1CheckInterval;
    let h1Text = "";

    function createFinanceOptGroup(innerText, baseValue) {
        const group = document.createElement("optgroup");
        group.label = innerText;

        const optionAut = document.createElement("option");
        optionAut.value = baseValue.trim() + " aut ctt";
        optionAut.innerText = 'Autoriza contato';

        const optionNao = document.createElement("option");
        optionNao.value = baseValue.trim() + " não aut ctt";
        optionNao.innerText = 'Não autoriza contato';

        const optionAguardando = document.createElement("option");
        optionAguardando.value = baseValue.trim() + " aguardando aut de ctt";
        optionAguardando.innerText = 'Aguardando autorização de contato';

        group.appendChild(optionAguardando);
        group.appendChild(optionAut);
        group.appendChild(optionNao);

        return group;
    }

    function showPopup(text) {
        let popup = document.createElement("div");
        popup.innerText = text;
        popup.style.position = "fixed";
        popup.style.left = "50%";
        popup.style.top = "-100px";
        popup.style.transform = "translateX(-50%)";
        popup.style.background = "green";
        popup.style.color = "black";
        popup.style.padding = "15px 30px";
        popup.style.fontSize = "18px";
        popup.style.borderRadius = "5px";
        popup.style.boxShadow = "0px 0px 10px rgba(0, 0, 0, 0.3)";
        popup.style.zIndex = "9999";
        popup.style.opacity = "0";
        popup.style.transition = "top 1s ease, opacity 1s ease";
        document.body.appendChild(popup);

        setTimeout(() => {
            popup.style.top = "20px";
            popup.style.opacity = "1";
        }, 100);

        setTimeout(() => {
            popup.style.top = "-100px";
            popup.style.opacity = "0";
        }, 4000);

        setTimeout(() => {
            popup.remove();
        }, 5000);
    }

    function checkFare() {
        if (document.getElementById("verificar-button")) return;

        const targetDiv = document.querySelector(".styles__CounterBlock-cONMuR.dZaCMx");
        if (!targetDiv) {
            console.log("Aguardando a div correta aparecer...");
            return;
        }

        const orderIdH1 = document.querySelector("h1");
        if (!orderIdH1 || orderIdH1.textContent.trim() === "") return;

        const userLinks = document.querySelectorAll(".styles__UserLink-gSQWOx.kSgELQ");
        if (userLinks.length < 2) return;

        const passangerId = userLinks[0].textContent.trim();
        const driverId = userLinks[1].textContent.trim();

        const allDdElements = document.querySelectorAll('dd');
        let rideUuid = null;
        for (let dd of allDdElements) {
            if (dd.textContent.trim().length === 36) {
                rideUuid = dd.textContent.trim();
                break;
            }
        }
        if (!rideUuid) return;

        const priceCorridaEl = document.querySelector(".bxuYuY");
        if (!priceCorridaEl) return;
        const priceCorrida = priceCorridaEl.innerText.trim();

        const h1Select = document.createElement("select");
        h1Select.style.display = "inline-block";
        h1Select.id = "h1-select";
        h1Select.style.marginLeft = "5px";

        const defaultH1Option = document.createElement("option");
        defaultH1Option.textContent = "Carregando título...";
        defaultH1Option.disabled = true;
        defaultH1Option.selected = true;
        h1Select.appendChild(defaultH1Option);

        h1CheckInterval = setInterval(() => {
            const orderIdH1 = document.querySelector("h1");
            if (orderIdH1 && orderIdH1.textContent.trim() !== "") {
                h1Text = orderIdH1.textContent.trim().replace(/^Order\s*/, "");

                h1Select.innerHTML = "";

                const optionDefault = document.createElement("option");
                optionDefault.textContent = `Caso de resolução`;
                optionDefault.disabled = true;
                optionDefault.selected = true;

                const option1 = document.createElement("option");
                option1.value = `Não pagamento ${priceCorrida}  // M ${driverId} e P ${passangerId} // https://cherdak.console3.com/br/new-order/orders/${h1Text} // Autoriza contato`;
                option1.textContent = "Enviar não pagou para resolução";

                const option2 = document.createElement("option");
                option2.value = `Reembolso: M ${driverId} // Corrida:  https://cherdak.console3.com/br/new-order/orders/${h1Text}`;
                option2.textContent = "Reembolso";

                h1Select.append(optionDefault, option1, option2);
                clearInterval(h1CheckInterval);
            }
        }, 1000);

        h1Select.addEventListener("change", function () {
            navigator.clipboard.writeText(this.value).then(() => {
                showPopup(this.value);
            });
        });

        const button = document.createElement("a");
        button.id = "verificar-button";
        button.innerText = "Verificar descontos";
        Object.assign(button.style, {
            display: "inline-block",
            background: "#90ee90",
            color: "black",
            textDecoration: "none",
            padding: "10px 15px",
            border: "none",
            borderRadius: "5px",
            fontSize: "16px",
            boxShadow: "2px 2px 10px rgba(0, 0, 0, 0.2)",
            cursor: "pointer",
            transition: "background 0.3s, box-shadow 0.3s",
            marginTop: "4px"
        });



        button.addEventListener("click", () => {
            if (!h1Text) {
                alert("Título ainda não carregado.");
                return;
            }
            const url = `https://cherdak.console3.com/global/user-balance/user-balance-transaction?countryCode=BR&currencyCode=BRL&sourceUUID=${h1Text}&userId=${driverId}`;
            window.open(url, "_blank");
        });

        const selectContainer = document.createElement("div");
        selectContainer.style.display = "flex";
        selectContainer.style.flexDirection = "row";
        selectContainer.style.gap = "10px";
        selectContainer.style.marginTop = "10px";

        const selectFinanceiro = document.createElement("select");
        const selectObjetos = document.createElement("select");
        const selectIncidentes = document.createElement("select");

        [selectFinanceiro, selectObjetos, selectIncidentes, h1Select].forEach(el => {
            Object.assign(el.style, {
                padding: "10px 15px",
                borderRadius: "5px",
                fontSize: "14px",
                boxShadow: "2px 2px 10px rgba(0, 0, 0, 0.2)",
                cursor: "pointer",
                marginTop: "4px",
                background: "#90ee90",
                color: "black",
                border: "none"
            });
        });

        const defaultOptionFinanceiro = document.createElement("option");
        defaultOptionFinanceiro.innerText = "Problema financeiro";
        defaultOptionFinanceiro.disabled = true;
        defaultOptionFinanceiro.selected = true;
        selectFinanceiro.appendChild(defaultOptionFinanceiro);

        selectFinanceiro.appendChild(createFinanceOptGroup("Motorista informa não pagamento", `M ${driverId} - informa que P ${passangerId} - não Pagou ${priceCorrida} //`));
        selectFinanceiro.appendChild(createFinanceOptGroup("Passageiro informa falta de troco", `P ${passangerId} informa que M ${driverId} - não devolveu troco //`));
        selectFinanceiro.appendChild(createFinanceOptGroup("Passageiro informa pix por engano", `P ${passangerId} que fez pix por engano M ${driverId} // Comprovante : // `));
        selectFinanceiro.appendChild(createFinanceOptGroup("Passageiro informa cobrança extra", `P ${passangerId} M ${driverId} cobrou a mais  // Comprovante : // `));
        selectFinanceiro.appendChild(createFinanceOptGroup("Passageiro informa que pagou 2x", `P ${passangerId} que pagou 2x a M ${driverId}   // Comprovante : // `));
        selectFinanceiro.appendChild(createFinanceOptGroup("Passageiro pagou e motorista não fez corrida ou fez incompleta", `P ${passangerId} relata que pagou a M ${driverId} sem ocorrer corrida  // Comprovante :  // `));

        const defaultOptionObjetos = document.createElement("option");
        defaultOptionObjetos.innerText = "Objeto perdido ou achado";
        defaultOptionObjetos.disabled = true;
        defaultOptionObjetos.selected = true;
        selectObjetos.appendChild(defaultOptionObjetos);

        selectObjetos.appendChild(createFinanceOptGroup("Objeto perdido", `P ${passangerId} relata que perdeu objeto: - no carro de M ${driverId} //`));
        selectObjetos.appendChild(createFinanceOptGroup("Objeto encontrado", `M ${driverId} informa ter encontrado objeto : de ${passangerId} //`));

        const defaultOptionIncidentes = document.createElement("option");
        defaultOptionIncidentes.innerText = "Incidentes";
        defaultOptionIncidentes.disabled = true;
        defaultOptionIncidentes.selected = true;
        selectIncidentes.appendChild(defaultOptionIncidentes);

        const optionFurto = document.createElement("option");
        optionFurto.value = `M ${driverId} relata que foi roubado por P ${passangerId} durante corrida //`;
        optionFurto.innerText = "Roubo";

        const optionDrogas = document.createElement("option");
        optionDrogas.value = `M ${driverId} relata que ${passangerId} transportava drogas em seu veículo //`;
        optionDrogas.innerText = "Drogas";

        selectIncidentes.append(optionFurto, optionDrogas);

        [selectFinanceiro, selectObjetos, selectIncidentes].forEach(sel => {
            sel.addEventListener("change", function () {
                navigator.clipboard.writeText(sel.value).then(() => {
                    showPopup(sel.value);
                }).catch(err => console.error("Erro ao copiar texto: ", err));
            });
        });

        targetDiv.append(button, h1Select, selectContainer);
        selectContainer.append(selectFinanceiro, selectObjetos, selectIncidentes);
        clearInterval(checkInterval);
    }

    function startInterval() {
        checkInterval = setInterval(checkFare, 1000);
    }

    document.addEventListener('keydown', function (e) {
        if (e.altKey && e.key.toLowerCase() === 'l') {
            checkFare();
        }
    });

    if (document.readyState === "complete") {
        startInterval();
    } else {
        window.addEventListener('load', startInterval);
    }
})();
