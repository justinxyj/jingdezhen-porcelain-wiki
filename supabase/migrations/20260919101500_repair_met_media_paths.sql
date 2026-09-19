-- Repair verified Met Open Access media paths that were stored with an invalid image ID placeholder.
-- The object/image IDs were checked against The Met collection pages.

update public.media
set path = case
  when path like '%/44735/???/main-image' then 'https://collectionapi.metmuseum.org/api/collection/v1/iiif/44735/1460309/main-image'
  when path like '%/52672/???/main-image' then 'https://collectionapi.metmuseum.org/api/collection/v1/iiif/52672/195458/main-image'
  when path like '%/48390/???/main-image' then 'https://collectionapi.metmuseum.org/api/collection/v1/iiif/48390/194607/main-image'
  when path like '%/199135/???/main-image' then 'https://collectionapi.metmuseum.org/api/collection/v1/iiif/199135/1683960/main-image'
  when path like '%/200855/???/main-image' then 'https://collectionapi.metmuseum.org/api/collection/v1/iiif/200855/1687684/main-image'
  when path like '%/208277/???/main-image' then 'https://collectionapi.metmuseum.org/api/collection/v1/iiif/208277/1777363/main-image'
  when path like '%/57441/???/main-image' then 'https://collectionapi.metmuseum.org/api/collection/v1/iiif/57441/74708/main-image'
  when path like '%/47973/???/main-image' then 'https://collectionapi.metmuseum.org/api/collection/v1/iiif/47973/184101/main-image'
  when path like '%/460666/???/main-image' then 'https://collectionapi.metmuseum.org/api/collection/v1/iiif/460666/915887/main-image'
  when path like '%/45842/???/main-image' then 'https://collectionapi.metmuseum.org/api/collection/v1/iiif/45842/1912441/main-image'
  when path like '%/49291/???/main-image' then 'https://collectionapi.metmuseum.org/api/collection/v1/iiif/49291/2468266/main-image'
  when path like '%/451848/???/main-image' then 'https://collectionapi.metmuseum.org/api/collection/v1/iiif/451848/907694/main-image'
  when path like '%/208000/???/main-image' then 'https://collectionapi.metmuseum.org/api/collection/v1/iiif/208000/420774/main-image'
  else path
end
where path like '%/???/main-image';
