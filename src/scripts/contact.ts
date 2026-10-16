export {};

      (function () {
        const btn = document.getElementById("downloadVcfBtn");
        if (!btn) return;

        btn.addEventListener("click", function () {
          const vcf =
            "BEGIN:VCARD\r\n" +
            "VERSION:3.0\r\n" +
            "N:Nichols;Luke;;;\r\n" +
            "FN:Luke Nichols\r\n" +
            "ORG:Nichols Tree Care\r\n" +
            "TITLE:Owner\r\n" +
            "URL:https://nicholstreecarellc.com\r\n" +
            "EMAIL;TYPE=WORK:luke@nicholstreecarellc.com\r\n" +
            "TEL;TYPE=WORK,VOICE:+15418808874\r\n" +
            "END:VCARD\r\n";

          const blob = new Blob([vcf], { type: "text/vcard;charset=utf-8" });
          const url = URL.createObjectURL(blob);

          const a = document.createElement("a");
          a.href = url;
          a.download = "Luke-Nichols.vcf";
          document.body.appendChild(a);
          a.click();
          a.remove();

          setTimeout(() => URL.revokeObjectURL(url), 800);
        });
      })();
    