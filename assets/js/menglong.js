/* Shared, dependency-free interactions for Menglong Doors & Windows. */
const isKhmer = document.documentElement.lang === 'km';
// Keep the same product selection and section when switching languages.
function updateLanguageLinks() {
  document.querySelectorAll('a[data-language]').forEach(link => {
    const destination = new URL(link.getAttribute('href'), window.location.href);
    destination.search = window.location.search;
    destination.hash = window.location.hash;
    link.href = destination.href;
  });
}
updateLanguageLinks();
window.addEventListener('hashchange', updateLanguageLinks);
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.site-nav');
const menuBackdrop = document.querySelector('.menu-backdrop');
function sizeMenu() {
  if (navigation) navigation.style.maxHeight = `${Math.max(100, window.innerHeight - navigation.getBoundingClientRect().top - 12)}px`;
}
function closeMenu() {
  navigation?.classList.remove('is-open');
  document.body.classList.remove('menu-open');
  if (menuBackdrop) menuBackdrop.hidden = true;
  if (navigation) navigation.style.maxHeight = '';
  if (menuButton) menuButton.querySelector('span').textContent = isKhmer ? 'ម៉ឺនុយ' : 'Menu';
  menuButton?.setAttribute('aria-expanded', 'false');
}
menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  if (!open) return closeMenu();
  navigation.classList.add('is-open');
  document.body.classList.add('menu-open');
  menuBackdrop.hidden = false;
  menuButton.querySelector('span').textContent = isKhmer ? 'បិទ' : 'Close';
  sizeMenu();
});
menuBackdrop?.addEventListener('click', () => { closeMenu(); menuButton.focus(); });
window.addEventListener('resize', () => { if (menuButton?.getAttribute('aria-expanded') === 'true') sizeMenu(); });
document.addEventListener('focusin', event => { if (!event.target.closest('.site-header')) closeMenu(); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton?.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuButton.focus();
  }
});
navigation?.addEventListener('click', event => {
  if (event.target.closest('a')) closeMenu();
});
window.matchMedia('(min-width: 1151px)').addEventListener('change', event => {
  if (event.matches) closeMenu();
});
document.addEventListener('click', event => {
  if (!event.target.closest('.site-header')) closeMenu();
});

const galleryCards = [...document.querySelectorAll('.gallery-card')];
document.querySelectorAll('[data-filter]').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-filter]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
    galleryCards.forEach(card => { card.hidden = button.dataset.filter !== 'all' && !card.dataset.category.split(' ').includes(button.dataset.filter); });
    const count = galleryCards.filter(card => !card.hidden).length;
    document.querySelector('.gallery-count').textContent = isKhmer ? `បង្ហាញរូបភាពចំនួន ${new Intl.NumberFormat('km-KH-u-nu-khmr').format(count)}` : `${count} photos shown`;
  });
});
const lightbox = document.querySelector('.lightbox');
let galleryTrigger;
let visiblePhotos = [];
let photoIndex = 0;
function showPhoto(index) {
  photoIndex = (index + visiblePhotos.length) % visiblePhotos.length;
  const button = visiblePhotos[photoIndex];
  const image = button.querySelector('img');
  lightbox.querySelector('img').src = image.currentSrc || image.src;
  lightbox.querySelector('img').alt = image.alt;
  const caption = lightbox.querySelector('.lightbox-caption');
  caption.textContent = button.dataset.caption || '';
  caption.hidden = !button.dataset.caption;
  const formatter = new Intl.NumberFormat(isKhmer ? 'km-KH-u-nu-khmr' : 'en');
  lightbox.querySelector('.photo-count').textContent = `${formatter.format(photoIndex + 1)} / ${formatter.format(visiblePhotos.length)}`;
  lightbox.querySelector('.photo-enquire').href = `contact.html?product=${encodeURIComponent(button.dataset.product || 'doors and windows')}#enquiry-form`;
  lightbox.querySelectorAll('.photo-prev,.photo-next').forEach(control => { control.disabled = visiblePhotos.length < 2; });
}
document.querySelectorAll('.gallery-button').forEach(button => {
  button.addEventListener('click', () => {
    galleryTrigger = button;
    visiblePhotos = [...document.querySelectorAll('.gallery-button')].filter(photo => !photo.closest('[hidden]'));
    showPhoto(visiblePhotos.indexOf(button));
    lightbox.showModal();
    document.body.classList.add('modal-open');
  });
});
lightbox?.querySelector('.photo-prev').addEventListener('click', () => showPhoto(photoIndex - 1));
lightbox?.querySelector('.photo-next').addEventListener('click', () => showPhoto(photoIndex + 1));
lightbox?.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    showPhoto(photoIndex + (event.key === 'ArrowRight' ? 1 : -1));
  }
});
lightbox?.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
lightbox?.addEventListener('click', event => {
  const bounds = lightbox.getBoundingClientRect();
  if (event.target === lightbox && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) lightbox.close();
});
lightbox?.addEventListener('close', () => {
  document.body.classList.remove('modal-open');
  galleryTrigger?.focus();
});

const enquiryForm = document.querySelector('#enquiry-form');
if (enquiryForm) {
  const requestedProduct = new URLSearchParams(window.location.search).get('product');
  const select = enquiryForm.querySelector('[name="product"]');
  if ([...select.options].some(option => option.value === requestedProduct)) select.value = requestedProduct;
  enquiryForm.addEventListener('submit', event => {
    event.preventDefault();
    enquiryForm.querySelectorAll('input[required]').forEach(input => {
      input.setCustomValidity(input.value.trim() ? '' : (isKhmer ? 'សូមបំពេញព័ត៌មានក្នុងប្រអប់នេះ។' : 'Please fill in this field.'));
    });
    if (!enquiryForm.reportValidity()) return;
    const data = new FormData(enquiryForm);
    const value = name => String(data.get(name) || '').trim();
    const productLabel = select.selectedOptions[0].textContent;
    const message = isKhmer
      ? `សួស្តី ម៉េង ឡុង ទ្វារ និងបង្អួច,\n\nខ្ញុំចង់សាកសួរអំពី ${productLabel}។\n\nឈ្មោះ៖ ${value('name')}\nទូរស័ព្ទ៖ ${value('phone')}\nទីតាំងគម្រោង៖ ${value('location')}\n\nព័ត៌មានគម្រោង៖\n${value('details') || 'ខ្ញុំចង់ពិភាក្សាជម្រើសជាមួយក្រុមការងារ។'}\n\nសូមទាក់ទងខ្ញុំដើម្បីពិភាក្សាជំហានបន្ទាប់។ សូមអរគុណ។`
      : `Hello Menglong Doors & Windows,\n\nI would like to enquire about ${productLabel}.\n\nName: ${value('name')}\nPhone: ${value('phone')}\nProject location: ${value('location')}\n\nProject details:\n${value('details') || 'I would like to discuss the options with your team.'}\n\nPlease contact me to discuss the next steps. Thank you.`;
    const result = document.querySelector('#enquiry-result');
    document.querySelector('#enquiry-message').value = message;
    const subject = (isKhmer ? 'សាកសួរអំពីទ្វារ និងបង្អួច — ' : 'Door & window enquiry — ') + productLabel;
    document.querySelector('#email-enquiry').href = `mailto:menglongdoorandwindow@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    document.querySelector('#copy-status').textContent = '';
    result.hidden = false;
    result.querySelector('h3').focus();
    result.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'nearest' });
  });
  enquiryForm.addEventListener('input', event => {
    event.target.setCustomValidity?.('');
    document.querySelector('#enquiry-result').hidden = true;
  });
  document.querySelector('#copy-enquiry').addEventListener('click', async () => {
    const message = document.querySelector('#enquiry-message');
    try {
      await navigator.clipboard.writeText(message.value);
      document.querySelector('#copy-status').textContent = isKhmer ? 'បានចម្លងសារ។ បិទភ្ជាប់ទៅ Messenger ដើម្បីផ្ញើទៅ ម៉េង ឡុង។' : 'Message copied. Paste it into Messenger to send to Menglong.';
    } catch {
      message.focus();
      message.select();
      document.querySelector('#copy-status').textContent = isKhmer ? 'ជ្រើសរើស និងចម្លងសារខាងលើ រួចបិទភ្ជាប់ទៅ Messenger។' : 'Select and copy the message above, then paste it into Messenger.';
    }
  });
}
