(function () {
  const selectorStrip = document.getElementById("selectorStrip");
  const selectorName = document.getElementById("selectorName");
  const selectorCopy = document.getElementById("selectorCopy");

  if (!selectorStrip || !selectorName || !selectorCopy) {
    return;
  }

  const cards = Array.from(selectorStrip.querySelectorAll(".selector-card"));
  const popups = Array.from(document.querySelectorAll(".popup"));
  let activeIndex = 0;

  function setActive(index, doScroll = false) {
    activeIndex = (index + cards.length) % cards.length;

    cards.forEach(function (card, cardIndex) {
      const isActive = cardIndex === activeIndex;
      card.classList.toggle("is-active", isActive);
      card.setAttribute("aria-pressed", String(isActive));

      if (isActive) {
        var name = card.dataset.name || "";
        selectorName.setAttribute("data-text", name);
        selectorName.innerHTML = "<span>" + name + "</span>";
        selectorCopy.textContent = card.dataset.copy || "";
        if (doScroll) {
          card.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
        }
      }
    });
  }

  cards.forEach(function (card, index) {
    card.addEventListener("click", function () {
      setActive(index, true);
    });
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      setActive(activeIndex + 1, true);
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setActive(activeIndex - 1, true);
    }
  });

  popups.forEach(function (popup) {
    const popupBar = popup.querySelector(".popup-bar");
    const popupClose = popup.querySelector(".popup-close");
    let isDragging = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;

    if (!popupBar || !popupClose) {
      return;
    }

    popupClose.addEventListener("click", function () {
      popup.classList.add("is-hidden");
    });

    popupBar.addEventListener("mousedown", function (event) {
      isDragging = true;
      const rect = popup.getBoundingClientRect();
      dragOffsetX = event.clientX - rect.left;
      dragOffsetY = event.clientY - rect.top;
      popup.style.transform = "none";
      popup.style.left = rect.left + "px";
      popup.style.top = rect.top + "px";
    });

    document.addEventListener("mousemove", function (event) {
      if (!isDragging) {
        return;
      }

      popup.style.left = event.clientX - dragOffsetX + "px";
      popup.style.top = event.clientY - dragOffsetY + "px";
    });

    document.addEventListener("mouseup", function () {
      isDragging = false;
    });
  });

  setActive(0, false);

  var emoteBtn = document.getElementById("emotePopupBtn");
  var emotePopup = document.getElementById("popup-emote");
  if (emoteBtn && emotePopup) {
    emoteBtn.addEventListener("click", function () {
      emotePopup.classList.remove("is-hidden");
    });
  }
})();
