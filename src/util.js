// someregistry.com/some/image:latest -> someregistry.com/some/image
export function imageFromImageWithTag(imageWithTag) {
  if (imageWithTag.lastIndexOf('/') !== -1) {
    const lastSlash = imageWithTag.lastIndexOf('/')

    if (imageWithTag.indexOf(':', lastSlash) !== -1) {
      return imageWithTag.substring(0, imageWithTag.indexOf(':', lastSlash))
    }

    return imageWithTag
  }

  if (imageWithTag.indexOf(':') !== -1) {
    return imageWithTag.substring(0, imageWithTag.indexOf(':'))
  }

  return imageWithTag
}

// someregistry.com/some/image:latest -> latest
export function tagFromImageWithTag(imageWithTag) {
  if (imageWithTag.lastIndexOf('/') !== -1) {
    const lastSlash = imageWithTag.lastIndexOf('/')

    if (imageWithTag.indexOf(':', lastSlash) !== -1) {
      return imageWithTag.substring(imageWithTag.indexOf(':', lastSlash) + 1)
    }

    return 'latest'
  }

  if (imageWithTag.indexOf(':') !== -1) {
    return imageWithTag.substring(imageWithTag.indexOf(':') + 1)
  }

  return 'latest'
}

// someregistry.com/some/image -> some/image
export function localImageFromImage(image) {
  if (image.lastIndexOf('/') === -1) {
    return 'library/' + image
  }

  if (image.split('/').length === 3) {
    return image.substring(image.indexOf('/') + 1)
  }

  return image
}
