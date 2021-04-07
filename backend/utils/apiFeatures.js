class APIFEATURES {
  constructor(query, queryStr){
    this.query = query;
    this.queryStr = queryStr;
  }

  // methods
  search(){
    const keyword = this.queryStr.keyword ? { 
      name:{
        $regex: this.queryStr.keyword,
        $options: 'i'
      }
    } : {}

    this.query = this.query.find({...keyword});

    return this
  };

  filter(){
    const queryCopy = {...this.queryStr};
    // remove fields
    const removeFields = ['keyword', 'limit', 'page'];
    removeFields.forEach((el) => delete queryCopy[el]);

    // Advance filter 
    let queryStr = JSON.stringify(queryCopy);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`);

    // search
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  };
  
  pagination(restPerPage){
    // get current page or default to 1
    const currentPage = Number(this.queryStr.page) || 1;
    // skip products
    const skip = restPerPage * (currentPage -1);
    
    this.query = this.query.limit(restPerPage).skip(skip);
    
    return this;
  };
  
};

module.exports = APIFEATURES