
main <- function(excludedPatientIDs = integer()) {

    output <- list()
    output$concept <- fetch_params$ontologyTerms$datapoints_n0$fullName
    output$excludedPatientIDs <- excludedPatientIDs

    df1 <- loaded_variables$datapoints_n0_s1
    df1 <- prepareData(df1, excludedPatientIDs)
    output <- addBoxplotStats(output, "Subset 1", df1)
    output$globalMin <- min(df1$value)
    output$globalMax <- max(df1$value)

    if(!is.null(loaded_variables$datapoints_n0_s2)) {
        df2 <- loaded_variables$datapoints_n0_s2
        df2 <- prepareData(df2, excludedPatientIDs)
        output <- addBoxplotStats(output, "Subset 2", df2)
        output$globalMin <- min(df1$value, df2$value)
        output$globalMax <- max(df1$value, df2$value)
    }

    toJSON(output)
}

prepareData <- function(df, excludedPatientIDs) {
    df <- na.omit(df)
    df$jitter <- runif(nrow(df), -0.5, 0.5)
    colnames(df) <- c("patientID", "value", "jitter")
    df <- df[!df$patientID %in% excludedPatientIDs, ]
    df
}

addBoxplotStats <- function(output, subset, df) {
    bxp <- boxplot(df$value, plot=FALSE)
    output[[subset]] <- list()
    output[[subset]]$lowerWhisker <- bxp$stats[1]
    output[[subset]]$lowerHinge <- bxp$stats[2]
    output[[subset]]$median <- bxp$stats[3]
    output[[subset]]$upperHinge <- bxp$stats[4]
    output[[subset]]$upperWhisker <- bxp$stats[5]
    outlier <- df$value > output[[subset]]$upperWhisker | df$value < output[[subset]]$lowerWhisker
    df$outlier <- outlier
    output[[subset]]$rawData <- df
    output
}
