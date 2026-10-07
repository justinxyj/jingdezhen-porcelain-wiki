import type { Database } from './database.types';
export interface Verification {status?:string; reviewed_at?:string; reviewer?:string; claim?:string; locator?:string}
export interface Source {url?:string; title?:string; label?:string; status?:string; source_type?:string; type?:string; category?:string; doi?:string; isbn?:string; citation?:string; claim?:string; relation?:string; provenance?:string; verification?:Verification}
export interface TimelinePoint {era?:string; lane?:string; year?:number; label?:string}
export interface MapPoint {lat:number; lng:number; country?:string; period?:string; type?:string; location?:string}
export interface EntryMeta {
 kind?:string; era?:string; era_group?:string; period?:string; role?:string; location?:string; region?:string; craft?:string;
 form?:string; type?:string; shape?:string; glaze?:string|string[]; pattern?:string|string[]; institution?:string;
 birth_year?:string|number; death_year?:string|number; lifespan?:string; importance?:string; keywords?:string[];
 description?:string; context?:string; quote_context?:string; quote?:string; quote_work?:string; quote_original?:string; quote_translation?:string;
 relation_to_jingdezhen?:string; jingdezhen_relation?:string; timeline_sort_year?:number;
 timeline?:TimelinePoint[]; map?:MapPoint; mediaPolicy?:{priority?:string[];categoryRule?:string};
}
export interface EntryText {title?:string;summary?:string;content?:string;meta?:EntryMeta;sources?:Source[]}
export type TimelineContext=Database['public']['Tables']['timeline_context']['Row'];
export interface Media {id:string;entry_id:string|null;path:string;title?:string|null;source?:string|null;license?:string|null;creator?:string|null;institution?:string|null;created_at?:string|null;captured_at?:string|null;location?:string|null;source_tier?:number|null;is_primary?:boolean|null;canonical_key?:string|null;source_url?:string|null;source_type?:string|null}
export type World=Database['public']['Tables']['knowledge_worlds']['Row'];
export interface Entry {
 timelineMatches?:TimelinePoint[];
 id:string;slug:string;category:string;zh:EntryText;en?:EntryText;ja?:EntryText;sources?:Source[];status:string;version?:number;updated_at?:string;
 media?:Media[];timelineContext?:Partial<TimelineContext>|null;dataStatus?:{status:string;failed:string[]};
 worldRole?:string|null;worldRationale?:string|null;worldOrder?:number|null;
 source_type?:'database'|'markdown';url?:string;topicWorld?:string;
 title?:string;type?:string;era?:string;summary?:string;image?:Media|null;keywords?:string[];
 worlds?:Array<World & {role?:string|null;rationale?:string|null}>;recommendations?:Recommendation[];
 discovery?:{score:number;hasMap:boolean;hasTimeline:boolean;eras:string[];lanes:string[]};
}
export interface Relation {semantic_label?:string;semantic_source_url?:string;semantic_note?:string;entry_id:string;related_entry_id:string;relation_type:string;note?:string|null;entry:Entry}
export interface Recommendation {source_node_id:string|null;target_node_id:string|null;target_label:string|null;target_category:string|null;edge_type:string|null;reason:string|null;weight:number|null;entry:Entry}
export interface SearchOptions {limit?:number;offset?:number;recommendationLimit?:number;category?:string|null;worldSlug?:string|null;era?:string|null;lane?:string|null;hasMap?:boolean|null;hasTimeline?:boolean|null;hasImage?:boolean|null;hasLiterature?:boolean|null}
export interface SearchPage {results:Entry[];total:number;facets:{categories:Array<{value:string;count:number}>;eras:Array<{value:string;count:number}>;lanes:Array<{value:string;count:number}>}}
export type GraphNode=Database['public']['Views']['knowledge_graph_nodes']['Row'];
export type GraphEdge=Database['public']['Views']['knowledge_graph_edges']['Row'];
export type Craft=Omit<Database['public']['Tables']['craft_processes']['Row'],'created_at'|'updated_at'|'reviewed_at'|'image_review_note'|'image_search_query'|'image_source_type'>;
export interface AtlasRelation {entry_id:string;related_entry_id:string;relation_type:string;note?:string|null;target:Entry;fromOwner?:boolean}
export interface PersonAtlas {entry:Entry;worlds:Array<Partial<World>&{role?:string;rationale?:string|null}>;relations:AtlasRelation[];works:Entry[];kilns:Entry[];documents:Entry[];relatedPeople:Entry[];sameEra:Entry[];craftProcesses:Array<Partial<GraphNode>&{rationale?:string|null}>;era:string;role:string;map:MapPoint|null}
export interface ObjectAtlas {entry:Entry;worlds:Array<Partial<World>&{role?:string;rationale?:string|null}>;relations:Relation[];people:Entry[];kilns:Entry[];documents:Entry[];craftProcesses:Array<Partial<GraphNode>&{rationale?:string|null}>;timeline:TimelinePoint[];map:MapPoint|null;period:string;craft:string}
export interface NetworkContext {entry:Entry;worlds:Array<Partial<World>&{role:string;rationale?:string|null}>;relations:Relation[];relationTruncated:boolean;recommendations:Recommendation[];craftProcesses:Array<Partial<GraphNode>&{rationale?:string|null}>;timeline:TimelinePoint[];eras:string[];lanes:string[];timelinePeers:Entry[];spaceEntries:Entry[];map:MapPoint|null;stats:{relationCount:number;relationTruncated:boolean;recommendationCount:number;timelinePeerCount:number;spaceCount:number}}
export type CraftNeighbor=Pick<Craft,'id'|'sequence'|'slug'|'name_zh'|'category'|'category_name'>;
export interface CraftContext {
 process:Craft;previous:CraftNeighbor|null;next:CraftNeighbor|null;
 entries:Array<{entry:Entry;era:string;map:MapPoint|null;people:Entry[];objects:Entry[];kilns:Entry[];documents:Entry[]}>;
 materials:string[];objects:Entry[];people:Entry[];kilns:Entry[];documents:Entry[];eras:string[];mappedEntries:Entry[];
 stats:{entries:number;truncatedEntries:boolean;truncatedRelations:boolean;people:number;objects:number;kilns:number;documents:number;eras:number;spaces:number};
}
