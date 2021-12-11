package common

import "strings"

// provide helper method to join types
func DbFormat(parts ...string) string {
	return strings.Join(parts, "$")
}
