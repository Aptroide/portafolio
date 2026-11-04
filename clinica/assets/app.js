(function () {
  /* ---------- Layout helper: real sticky header height ---------- */
  var top = document.querySelector('.top');
  if (top && window.ResizeObserver) {
    new ResizeObserver(function () {
      document.documentElement.style.setProperty('--hdr', top.offsetHeight + 'px');
    }).observe(top);
  }

  /* ---------- Closed knowledge base for the demo advisor ---------- */
  var WA = 'https://wa.me/?text=' + encodeURIComponent('Hola, quiero agendar mi valoración gratuita');
  var KB = [
    {k:['hola','buenas','buenos','que tal'], a:'¡Hola! Soy el asesor virtual de Alineo. Puedo ayudarte con precios, duración, cuidados y ubicaciones.'},
    {k:['precio','costo','cuanto cuesta','cuesta','pagar','pago','msi','meses','intereses','plan'], a:'Tenemos tres planes: Esencial (valoración 3D) $890, Plus $18,900 y Premium $32,900 MXN. Puedes pagar en la clínica y diferir hasta 12 meses sin intereses con tarjetas participantes. (Precios de ejemplo)'},
    {k:['dura','duracion','tiempo','tarda','cuanto tiempo'], a:'Un tratamiento corto dura de 6 a 9 meses y uno completo de 12 a 18, según tu caso. En la valoración 3D te mostramos tu plan y tiempos estimados.'},
    {k:['dolor','duele','molest','lastima'], a:'Es normal sentir una presión leve los primeros días de cada nuevo juego de alineadores, pero no es doloroso. Si algo te preocupa, tu especialista te orienta.'},
    {k:['cuidado','limpi','cepill','comer','horas','usar'], a:'Usa tus alineadores unas 22 horas al día, quítatelos para comer y cepíllate antes de volver a ponértelos. Límpialos con agua fría y un cepillo suave.'},
    {k:['donde','ubicacion','direccion','clinica','sucursal','mapa','llegar','cerca'], a:'Tenemos tres clínicas de ejemplo: Centro, Norte y Sur. En la página “Clínicas” ves direcciones y horarios, y puedes agendar en la que prefieras.'},
    {k:['edad','adolescente','adulto','candidato','sirve','puedo usar'], a:'Funciona para la mayoría de adultos y adolescentes con dientes permanentes. Solo un especialista puede confirmar si eres candidato en tu valoración.'},
    {k:['agendar','cita','reservar','valoracion','whatsapp','hablar','contacto'], a:'¡Claro! La valoración 3D no tiene costo. Te paso a WhatsApp para elegir clínica y horario.', wa:true},
    {k:['diagnost','enfermedad','medicamento','receta','tengo caries','infeccion'], a:'No puedo diagnosticar ni recomendar tratamientos. Para eso necesitas una valoración con un especialista.', wa:true},
    {k:['gracias','perfecto','genial'], a:'¡Con gusto! Si quieres, agenda tu valoración gratuita por WhatsApp.', wa:true}
  ];
  var FALLBACK = 'No tengo esa información validada y prefiero no inventarla. Una persona de nuestro equipo puede ayudarte por WhatsApp.';
  var CHIPS = ['¿Cuánto cuesta?','¿Cuánto dura?','¿Duele?','¿Dónde están?','Quiero agendar'];

  function norm(s){return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');}
  function answer(q){
    var t = norm(q), best = null, score = 0;
    KB.forEach(function (e) {
      var n = 0; e.k.forEach(function (w) { if (t.indexOf(w) !== -1) n++; });
      if (n > score) { score = n; best = e; }
    });
    return best ? best : {a: FALLBACK, wa: true};
  }

  /* ---------- Chat component (safe DOM, no innerHTML with user text) ---------- */
  function el(tag, cls, text){var e=document.createElement(tag); if(cls) e.className=cls; if(text!=null) e.textContent=text; return e;}
  function mountChat(root, opts) {
    opts = opts || {};
    var box = el('div','chat'); box.style.height = '100%';
    var h = el('div','chat-h');
    var av = el('span','av'); av.innerHTML = '<svg class="i"><use href="#i-bot"/></svg>';
    var tt = el('div'); tt.appendChild(el('b',null,'Asesor Alineo')); tt.appendChild(el('small',null,'IA · responde con información validada'));
    var x = el('button','x','×'); x.type='button'; x.setAttribute('aria-label','Cerrar asesor');
    h.appendChild(av); h.appendChild(tt); h.appendChild(x);
    var msgs = el('div','msgs'); msgs.setAttribute('role','log'); msgs.setAttribute('aria-live','polite');
    var qr = el('div','qr');
    var form = el('form','cf');
    var input = el('input'); input.type='text'; input.placeholder='Escribe tu pregunta…'; input.setAttribute('aria-label','Tu pregunta'); input.maxLength = 200;
    var send = el('button'); send.type='submit'; send.setAttribute('aria-label','Enviar'); send.innerHTML='<svg class="i"><use href="#i-send"/></svg>';
    form.appendChild(input); form.appendChild(send);
    var disc = el('div','disc','No diagnostica ni guarda datos de salud. Demostración con respuestas de ejemplo.');
    [h,msgs,qr,form,disc].forEach(function(n){box.appendChild(n);});
    root.appendChild(box);

    function add(text, who, withWa) {
      var m = el('div','m '+who,text);
      if (withWa) {
        var a = el('a','btn btn-wa'); a.href = WA; a.target='_blank'; a.rel='noopener';
        a.innerHTML = '<svg class="i"><use href="#i-wa"/></svg>'; a.appendChild(document.createTextNode('Agendar por WhatsApp'));
        m.appendChild(a);
      }
      msgs.appendChild(m); msgs.scrollTop = msgs.scrollHeight; return m;
    }
    function ask(q) {
      q = (q || '').trim(); if (!q) return;
      add(q,'me');
      var typing = el('div','m bot'); typing.innerHTML = '<span class="typing"><i></i><i></i><i></i></span>';
      msgs.appendChild(typing); msgs.scrollTop = msgs.scrollHeight;
      var r = answer(q);
      setTimeout(function () { typing.remove(); add(r.a,'bot',r.wa); }, 600);
    }
    CHIPS.forEach(function (c) {
      var b = el('button',null,c); b.type='button'; b.addEventListener('click', function(){ask(c);}); qr.appendChild(b);
    });
    form.addEventListener('submit', function (e) { e.preventDefault(); ask(input.value); input.value=''; });
    x.addEventListener('click', function(){ if (opts.onClose) opts.onClose(); });
    add('¡Hola! Soy el asesor virtual de Alineo. Resuelvo dudas sobre precios, duración, cuidados y clínicas. ¿En qué te ayudo?','bot');
    if (opts.seed) { add('¿Cuánto cuesta?','me'); add(answer('cuánto cuesta').a,'bot'); }
    return {focus:function(){input.focus();}};
  }

  var inline = document.getElementById('chat-inline');
  if (inline) mountChat(inline, {seed:true});

  var pop = document.getElementById('chat-pop'), dock = document.getElementById('dock'), popChat = null;
  function openChat() {
    if (!popChat) popChat = mountChat(pop, {onClose: closeChat});
    pop.classList.add('on'); dock.classList.add('hide'); popChat.focus();
  }
  function closeChat() { pop.classList.remove('on'); dock.classList.remove('hide'); }
  document.querySelectorAll('[data-open-chat]').forEach(function (b) { b.addEventListener('click', openChat); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeChat(); });

  /* ---------- Lead form (demo only, nothing is sent) ---------- */
  var lead = document.getElementById('lead');
  if (lead) lead.addEventListener('submit', function (e) {
    e.preventDefault();
    var b = lead.querySelector('button[type=submit]'); b.textContent = 'Gracias, es una demostración'; b.disabled = true;
  });
})();
