
export const createHashId = function(){

	return Math.random().toString(36).substring(2, 15) + new Date().getTime() + Math.random().toString(36).substring(2, 15) + Math.floor( Math.random() * 10000 );

}
