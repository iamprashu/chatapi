pipeline {
  agent any

  environment {
    IMAGE_NAME = "demoapp:${env.BUILD_NUMBER}"
    DEP_REPORT_DIR = "dc-report"
    DEP_REPORT_HTML = "dependency-check-report.html"
    DEP_REPORT_XML = "dependency-check-report.xml"
    APP_CONTAINER = "demoapp-${env.BUILD_NUMBER}"
  }

  stages {

    stage('Checkout Code') {
      steps {
        checkout scm
      }
    }

    stage('Build Docker Image') {
      steps {
        sh '''
          echo "Building Docker image..."
          docker build -t ${IMAGE_NAME} .
        '''
      }
    }

    stage('OWASP Dependency-Check Scan') {
  steps {
    withCredentials([string(credentialsId: 'NVD_API_KEY', variable: 'NVDKEY')]) {
      sh '''#!/bin/bash

        set -euo pipefail

        echo "Preparing Dependency-Check directories..."
        mkdir -p ${DEP_REPORT_DIR}
        mkdir -p dependency-check-data

        echo "Running OWASP Dependency-Check..."
        docker run --rm \
          -e "DC_JAVA_OPTS=-Xmx2g" \
          -v $(pwd):/src \
          -v $(pwd)/${DEP_REPORT_DIR}:/report \
          -v $(pwd)/dependency-check-data:/usr/share/dependency-check/data \
          owasp/dependency-check \
          --scan /src \
          --format ALL \
          --nvdApiKey $NVDKEY \
          --out /report 2>&1 | tee ${DEP_REPORT_DIR}/dc.log

        echo "Checking if XML report exists..."

        if [ ! -s ${DEP_REPORT_DIR}/${DEP_REPORT_XML} ]; then
          echo "ERROR: XML report missing or empty!"
          tail -200 ${DEP_REPORT_DIR}/dc.log || true
          exit 12
        fi
      '''
    }
  }
  post {
    always {
      archiveArtifacts artifacts: "${DEP_REPORT_DIR}/*", allowEmptyArchive: false
    }
  }
}


    stage('Fail on High Vulnerabilities') {
      steps {
        script {
          echo "Scanning XML report for HIGH severity vulnerabilities..."

          def xml = readFile("${DEP_REPORT_DIR}/${DEP_REPORT_XML}")

          if (xml.contains("<severity>High</severity>")) {
            echo "High severity vulnerabilities detected!"
            error("Blocking deployment due to HIGH vulnerabilities.")
          } else {
            echo "No High vulnerabilities found."
          }
        }
      }
    }

    stage('Deploy Application') {
      steps {
        sh '''
          echo "Deploying app container..."

          # Stop old container if exists
          if docker ps -a --format "{{.Names}}" | grep -w deployed-demoapp; then
            docker rm -f deployed-demoapp || true
          fi

          # Run new container
          docker run -d --name deployed-demoapp -p 3001:3000 ${IMAGE_NAME}
        '''
      }
    }

  } 

  post {
    always {
      sh 'docker image prune -f || true'
    }
    success {
      echo "Pipeline completed successfully!"
    }
    failure {
      echo "Pipeline failed — check logs and Dependency-Check report."
    }
  }

}
