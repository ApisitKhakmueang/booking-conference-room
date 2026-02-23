package customError

import "errors"

var ErrorNotFound = errors.New("booking not found or status is not 'confirm'")