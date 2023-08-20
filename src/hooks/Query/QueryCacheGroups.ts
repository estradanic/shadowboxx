/** Cache groups used in @tanstack/query useQuery and useInfiniteQuery */
enum QueryCacheGroups {
  GET_ALBUM = "GET_ALBUM",
  GET_IMAGES_BY_ID = "GET_IMAGES_BY_ID",
  GET_IMAGE_BY_ID = "GET_IMAGE_BY_ID",
  GET_USER_BY_ID = "GET_USER_BY_ID",
  GET_USERS_BY_EMAIL = "GET_USERS_BY_EMAIL",
  GET_USER_BY_EMAIL = "GET_USER_BY_EMAIL",
  GET_RELATED_USER_EMAILS = "GET_RELATED_USER_EMAILS",
  GET_DUPLICATES = "GET_DUPLICATES",
  GET_ALL_ALBUMS_INFINITE = "GET_ALL_ALBUMS_INFINITE",
  GET_ALL_IMAGES_INFINITE = "GET_ALL_IMAGES_INFINITE",
  GET_IMAGES_BY_ID_INFINITE = "GET_IMAGES_BY_ID_INFINITE",
  GET_IMAGES_BY_OWNER_INFINITE = "GET_IMAGES_BY_OWNER_INFINITE",
  GET_ALBUM_CHANGE_NOTIFICATIONS = "GET_ALBUM_CHANGE_NOTIFICATIONS",
  GET_ALL_MODIFYABLE_ALBUMS_INFINITE = "GET_ALL_MODIFYABLE_ALBUMS_INFINITE",
  GET_IMAGE_URL = "GET_IMAGE_URL",
  GET_ALL_TAGS = "GET_ALL_TAGS",
  GET_TAGS_BY_IMAGE_ID = "GET_TAGS_BY_IMAGE_ID",
}

export default QueryCacheGroups;
