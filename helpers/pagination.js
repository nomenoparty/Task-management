module.exports = (objectPagination, query, countRecords) => {
	if(query.page){	
		objectPagination.currentPage = parseInt(query.page);
	}

	if(query.limit){	
		objectPagination.limitItems = parseInt(query.limit);
	}

	objectPagination.skip = (objectPagination.currentPage - 1) * objectPagination.limitItems;
	objectPagination.totalPage = Math.ceil(countRecords / objectPagination.limitItems);
	
	return objectPagination;
};