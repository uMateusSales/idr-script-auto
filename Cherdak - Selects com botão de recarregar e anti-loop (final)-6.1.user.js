// ==UserScript==
// @name         Cherdak - Selects com botão de recarregar e anti-loop (final)
// @namespace    http://tampermonkey.net/
// @version      6.1
// @description  Insere selects dinâmicos após carregar botão e dados, com segurança no console3
// @match        *://cherdak.console3.com/br/user-service*
// @grant        GM_setClipboard
// ==/UserScript==

(function () {
    'use strict';

    function extrairInformacoes() {
        const h3s = Array.from(document.querySelectorAll("h3"));
        const usId = h3s.map(el => el.innerText.trim()).find(txt => /^\d/.test(txt)) || "";

        const labels = Array.from(document.querySelectorAll("label"));
        const cidadeLabel = labels.find(label => label.innerText.trim().toLowerCase() === "city");
        const nomeLabel = labels.find(label => label.innerText.trim().toLowerCase() === "name");

        const cidade = cidadeLabel?.parentElement?.querySelector("p")?.innerText.trim() || "";
        const nome = nomeLabel?.parentElement?.querySelector("p")?.innerText.trim() || "";

        const numeroP = Array.from(document.querySelectorAll("p")).find(p => p.innerText.trim().startsWith("55"));
        const numero = numeroP?.innerText.trim() || "";

        return { usId, cidade, nome, numero };
    }

    function createFloatingSelects({ usId, cidade, nome, numero }) {
        if (!(usId && cidade && nome && numero)) {
            console.log("⏳ Aguardando dados completos...");
            return;
        }

        document.querySelectorAll(".select-us, .select-push").forEach(e => e.remove());

        const container = document.createElement("div");
        Object.assign(container.style, {
            position: "fixed",
            top: "100px",
            right: "20px",
            backgroundColor: "#fff",
            border: "2px solid #c1f11d",
            borderRadius: "10px",
            padding: "10px",
            zIndex: "9999",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
        });

        const selectUS = createCustomSelect(usId, cidade);
        const selectPush = createNotificationSelect(nome, numero);

        container.appendChild(selectUS);
        container.appendChild(selectPush);

        document.body.appendChild(container);
        console.log("✅ Selects criados e inseridos flutuando.");
    }

    function createCustomSelect(usId, cidade) {
        const select = document.createElement("select");
        select.classList.add("select-us");
        Object.assign(select.style, {
            marginBottom: "10px",
            padding: "5px",
            fontWeight: "bold",
            fontSize: "14px",
            borderRadius: "5px",
            backgroundColor: "#c1f11d",
            width: "100%"
        });

        const options = [
            "Verificar Motorista",
            "Verificar entregador",
            "Verificar Troca de veiculo",
            "Verificar Intercity",
            "Verificar Frete",
            "Verificar Checkin",
            "Verificar Moto taxi"
        ];

select.innerHTML = `<option disabled selected>Escolha uma opção</option>`;
        options.forEach(text => {
            const opt = document.createElement("option");
            opt.value = `${usId} - ${cidade} - ${text}`;
            opt.innerText = text;
            select.appendChild(opt);
        });

        select.addEventListener("change", () => {
            navigator.clipboard.writeText(select.value).then(() => showPopup("Copiado: " + select.value));
        });

        return select;
    }

    function createNotificationSelect(nome, numero) {
        const select = document.createElement("select");
        select.classList.add("select-push");
        Object.assign(select.style, {
            padding: "5px",
            fontWeight: "bold",
            fontSize: "14px",
            borderRadius: "5px",
            backgroundColor: "#c1f11d",
            width: "100%"
        });

        const mensagens = [
            {
                text: "Não pagamento",
                value: `Olá!\nRecebemos a notificação de que ficou em aberto o valor da corrida. Por gentileza entre em contato com ${nome} no número ${numero} para esclarecer o ocorrido.`
            },
            {
                text: "Troco não devolvido",
                value: `Olá, o passageiro ${nome} nos relatou sobre um desentendimento financeiro, o mesmo informa que não recebeu o troco, por gentileza entre em contato pelo fone: ${numero}, para que a situação seja resolvida. SUJEITO A BLOQUEIO`
            },
            {
                text: "Cobrança extra",
                value: `Olá! Passageiro ${nome} alega cobrança indevida, por favor regularizar situação com o mesmo pelo número ${numero}, e entre em contato pelo support@indrive.com para confirmar o pagamento, ou sua conta está sujeita a bloqueio.`
            },
            {
                text: "Pix errado",
                value: `Olá! Passageiro ${nome} alega pix feito por engano, por favor regularizar situação com o mesmo pelo número ${numero}, e entre em contato pelo support@indrive.com para confirmar o pagamento, ou sua conta está sujeita a bloqueio.`
            }
        ];

        select.innerHTML = `<option disabled selected>Pushs preenchidos</option>`;
        mensagens.forEach(msg => {
            const opt = document.createElement("option");
            opt.value = msg.value;
            opt.innerText = msg.text;
            select.appendChild(opt);
        });

        select.addEventListener("change", () => {
            navigator.clipboard.writeText(select.value).then(() => showPopup("Copiado: " + select.value));
        });

        return select;
    }

    function showPopup(text) {
        const popup = document.createElement("div");
        popup.innerText = text;
        Object.assign(popup.style, {
            position: "fixed",
            top: "-100px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#c1f11d",
            padding: "10px 20px",
            fontSize: "14px",
            borderRadius: "5px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
            transition: "top 0.5s ease, opacity 0.5s ease",
            zIndex: "9999",
            opacity: "0"
        });
        document.body.appendChild(popup);

        setTimeout(() => {
            popup.style.top = "20px";
            popup.style.opacity = "1";
        }, 100);

        setTimeout(() => {
            popup.style.top = "-100px";
            popup.style.opacity = "0";
        }, 3000);

        setTimeout(() => {
            popup.remove();
        }, 4000);
    }

    function esperarEInserir() {
        const observer = new MutationObserver(() => {
            const { usId, cidade, nome, numero } = extrairInformacoes();
            if (usId && cidade && nome && numero) {
                observer.disconnect();
                createFloatingSelects({ usId, cidade, nome, numero });
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    if (document.readyState === "complete") {
        esperarEInserir();
    } else {
        window.addEventListener("load", esperarEInserir);
    }
})();

