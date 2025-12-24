const asyncHandler = (requestHandler) => {
    return (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).
        catch((error)=>{
            next(error);
        })
    }
}

export {asyncHandler};

// this is just a utility to make handling everything easier even if you decide to add auth next, you can wrap your route handlers with it