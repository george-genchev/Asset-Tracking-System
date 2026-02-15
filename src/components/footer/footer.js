import "./footer.css";

export function initFooter() {
  const newsletterForm = document.getElementById("newsletterForm");
  
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", handleNewsletterSubmit);
  }
}

function handleNewsletterSubmit(e) {
  e.preventDefault();
  
  const form = e.target;
  const emailInput = form.querySelector('input[type="email"]');
  const email = emailInput.value;
  
  if (email) {
    // Show success feedback
    const button = form.querySelector('.btn-newsletter');
    const originalHTML = button.innerHTML;
    
    button.innerHTML = '<i class="bi bi-check-circle-fill"></i>';
    button.disabled = true;
    
    // Reset form after 2 seconds
    setTimeout(() => {
      form.reset();
      button.innerHTML = originalHTML;
      button.disabled = false;
    }, 2000);
    
    // Here you would typically send the email to your backend
    console.log("Newsletter signup:", email);
  }
}
