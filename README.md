# Wedding Invitation Deployment Notes

## RSVP delivery

The form submits directly to `thedetorres11172026@gmail.com` through FormSubmit.

After the website is hosted, submit the form once and open the activation email sent by FormSubmit to that inbox. Confirm the form endpoint. Future guest responses will then be delivered directly to the same address.

Do not use a real guest’s details for activation; use an obvious test response and delete the test email afterward.

## Hosting

Upload the entire contents of this folder while preserving the `assets/` directory. The site has no build step and can be hosted on any static provider.

## Social preview

`assets/social-preview.jpg` is the sharing image. Once the final public domain is known, change the `og:image` and `twitter:image` values in `index.html` to absolute HTTPS URLs and add a canonical URL.

## Source artwork

Full-resolution source artwork is stored in the workspace-level `references/` folder. The deployable site uses optimized WebP derivatives.
